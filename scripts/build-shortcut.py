"""Build a credential-free Apple Shortcut; sign on macOS before distribution."""
import argparse
import plistlib
from pathlib import Path
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--site', default='https://snabb.studio')
args = parser.parse_args()
if not args.site.startswith('https://') or args.site.endswith('/'):
    parser.error('Use an HTTPS origin without a trailing slash')
actions = []
def token(kind, **values):
    return {'Value': {'Type': kind, **values}, 'WFSerializationType': 'WFTextTokenAttachment'}
def text(*parts):
    value, attachments = '', {}
    for part in parts:
        if isinstance(part, dict):
            attachments['{%d, 1}' % len(value)] = part['Value']
            value += '\ufffc'
        else:
            value += part
    return {'Value': {'string': value, 'attachmentsByRange': attachments}, 'WFSerializationType': 'WFTextTokenString'}
def action(name, **params):
    uid = str(uuid4()).upper()
    actions.append({'WFWorkflowActionIdentifier': 'is.workflow.actions.' + name, 'WFWorkflowActionParameters': {'UUID': uid, **params}})
    return token('ActionOutput', OutputUUID=uid, OutputName=name)
def dictionary(values):
    return {'Value': {'WFDictionaryFieldValueItems': [{'WFItemType': 0, 'WFKey': text(k), 'WFValue': text(v)} for k, v in values.items()]}, 'WFSerializationType': 'WFDictionaryFieldValue'}
def check_error(response):
    error = action('getvalueforkey', WFInput=response, WFDictionaryKey='error', WFGetDictionaryValueType='Value')
    group = str(uuid4()).upper()
    action('conditional', WFInput={'Type': 'Variable', 'Variable': error}, WFCondition=100, WFControlFlowMode=0, GroupingIdentifier=group)
    action('alert', WFAlertActionTitle='snabb.studio', WFAlertActionMessage=text(error), WFAlertActionCancelButtonShown=False)
    action('exit', WFInput=text(''))
    action('conditional', WFControlFlowMode=2, GroupingIdentifier=group)

site = action('gettext', WFTextActionText=args.site)
key = action('gettext', WFTextActionText='KListra in din uppladdningsnyckel här')
action('comment', WFCommentActionText='Dela en vald bild från Bilder. Endast en webbkopia laddas upp. Nyckeln kan skapa utkast men inte publicera. Dela inte genvägen efter att du lagt in din nyckel.')
photo = action('getitemfromlist', WFInput=token('ExtensionInput'), WFItemSpecifier='First Item')
resized = action('image.resize', WFImage=photo, WFImageResizeWidth=1600)
jpeg = action('image.convert', WFInput=resized, WFImageFormat='JPEG', WFImageCompressionQuality=0.8, WFImagePreserveMetadata=False)
encoded = action('base64encode', WFInput=jpeg, WFEncodeMode='Encode', WFBase64LineBreakMode='None')
headers = dictionary({'Authorization': ''})
# dictionary() accepts interpolated token strings too.
headers['Value']['WFDictionaryFieldValueItems'][0]['WFValue'] = text('Bearer ', key)
response = action('downloadurl', WFURL=text(site, '/api/shortcut'), WFHTTPMethod='GET', WFHTTPHeaders=headers, ShowHeaders=True)
check_error(response)
choices = action('getvalueforkey', WFInput=response, WFDictionaryKey='choices', WFGetDictionaryValueType='Value')
labels = action('getvalueforkey', WFInput=choices, WFGetDictionaryValueType='All Keys')
selected = action('choosefromlist', WFInput=labels, WFChooseFromListActionPrompt='Välj serie', WFChooseFromListActionSelectMultiple=False)
series = action('getvalueforkey', WFInput=choices, WFDictionaryKey=text(selected), WFGetDictionaryValueType='Value')
response = action('downloadurl', WFURL=text(site, '/api/shortcut'), WFHTTPMethod='POST', WFHTTPHeaders=headers, ShowHeaders=True, WFHTTPBodyType='JSON', WFJSONValues=dictionary({'image': encoded, 'seriesId': series, 'alt': ''}))
check_error(response)
preview = action('getvalueforkey', WFInput=response, WFDictionaryKey='previewPath', WFGetDictionaryValueType='Value')
action('openurl', WFInput=text(site, preview))
workflow = {
    'WFWorkflowName': 'snabb.studio',
    'WFWorkflowClientRelease': '3.0', 'WFWorkflowClientVersion': '3036.0.4.2',
    'WFWorkflowMinimumClientVersion': 900,
    'WFWorkflowIcon': {'WFWorkflowIconStartColor': 1231260415, 'WFWorkflowIconGlyphNumber': 59511},
    'WFWorkflowTypes': ['ActionExtension'],
    'WFWorkflowInputContentItemClasses': ['WFImageContentItem'],
    'WFWorkflowOutputContentItemClasses': [],
    'WFWorkflowActions': actions,
    'WFWorkflowImportQuestions': [
        {'ActionIndex': 0, 'Category': 'Parameter', 'ParameterKey': 'WFTextActionText', 'Text': 'Webbplatsens adress', 'DefaultValue': args.site},
        {'ActionIndex': 1, 'Category': 'Parameter', 'ParameterKey': 'WFTextActionText', 'Text': 'Klistra in uppladdningsnyckeln från Studio → iPhone', 'DefaultValue': ''},
    ],
}
output = ROOT / 'shortcuts' / 'snabb-studio-unsigned.shortcut'
output.write_bytes(plistlib.dumps(workflow, fmt=plistlib.FMT_BINARY))
print(f'{len(actions)} actions written to {output}')

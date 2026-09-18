import {readState, readImage, mutateState} from '../lib/server/storage.mjs';
import {planImageDimensions, applyImageDimensions} from '../lib/server/backfill-dimensions.mjs';
// Dry run unless --write is explicit. Use the intended local/Netlify store env.
const {state}=await readState();
const updates=await planImageDimensions(state.photos, readImage);
console.table(updates);
console.log(`${updates.length} photographs need exact thumbnail dimensions.`);
if (process.argv.includes('--write') && updates.length) {
  await mutateState(current=>applyImageDimensions(current, updates),state.revision);
  console.log('Dimensions saved. Images and publication state are unchanged.');
} else if(updates.length) console.log('Dry run. Pass --write to save.');

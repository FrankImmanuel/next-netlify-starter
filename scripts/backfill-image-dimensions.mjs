import sharp from 'sharp';
import {readState, readImage, mutateState} from '../lib/server/storage.mjs';
// Dry run unless --write is explicit. Use the intended local/Netlify store env.
const {state}=await readState();
const updates=[];
for (const photo of state.photos) {
  if (photo.thumbnailWidth || (photo.src && !photo.src.startsWith('/api/media/'))) continue;
  const bytes=await readImage(`${photo.id}-640`);
  if (!bytes) throw new Error(`Missing thumbnail: ${photo.id}`);
  const {width}=await sharp(bytes).metadata();
  updates.push({id:photo.id,width});
}
console.log(`${updates.length} photographs need exact thumbnail dimensions.`);
if (process.argv.includes('--write') && updates.length) {
  await mutateState(current=>{
    for(const {id,width} of updates) current.photos.find(p=>p.id===id).thumbnailWidth=width;
    return current;
  },state.revision);
  console.log('Dimensions saved. Images and publication state are unchanged.');
} else if(updates.length) console.log('Dry run. Pass --write to save.');

import { api, method, requireAdmin } from '../../../lib/server/auth.mjs';
import { uploadPhoto } from '../../../lib/server/upload.mjs';
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
export default api(async (req, res) => {
  method(req, ['POST']); await requireAdmin(req);
  const photo = await uploadPhoto(req.body);
  res.status(201).json({ photo });
});

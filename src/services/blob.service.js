const { put, del } = require('@vercel/blob');

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

async function uploadTemplate(fileBuffer, fileName, userId) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `templates/${userId}/${Date.now()}-${safeName}`;

  const { url } = await put(key, fileBuffer, {
    access: 'public',
    contentType: DOCX_MIME,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { url, key };
}

async function deleteBlob(blobUrl) {
  try {
    await del(blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (err) {
    console.error('[Blob] Erreur suppression:', err.message);
  }
}

module.exports = { uploadTemplate, deleteBlob };

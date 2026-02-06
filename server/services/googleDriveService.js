const { google } = require('googleapis');
const crypto = require('crypto');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return null;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function encrypt(text) {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) return text; // no-op if not configured
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(payload) {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) return payload; // no-op if not configured
  const parts = payload.split(':');
  if (parts.length !== 3) return payload;
  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = Buffer.from(parts[2], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

async function ensureFolder(drive, name, parentId = null) {
  // Search for existing folder with given name under parentId
  const qParts = [`name='${name.replace("'", "\\'")}'`, `mimeType='application/vnd.google-apps.folder'`, "trashed=false"];
  if (parentId) qParts.push(`'${parentId}' in parents`);
  const q = qParts.join(' and ');
  const res = await drive.files.list({
    q,
    fields: 'files(id, name)',
    spaces: 'drive',
    pageSize: 1,
  });
  if (res.data.files && res.data.files.length > 0) return res.data.files[0].id;

  // Create folder
  const fileMetadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) fileMetadata.parents = [parentId];
  const created = await drive.files.create({
    resource: fileMetadata,
    fields: 'id',
  });
  return created.data.id;
}

class GoogleDriveService {
  encryptToken(text) { return encrypt(text); }
  decryptToken(text) { return decrypt(text); }
  getAuthUrl(state) {
    const oauth2Client = getOAuthClient();
    if (!oauth2Client) throw new Error('GOOGLE_NOT_CONFIGURED');
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
      state,
    });
  }

  async exchangeCodeForTokens(code) {
    const oauth2Client = getOAuthClient();
    if (!oauth2Client) throw new Error('GOOGLE_NOT_CONFIGURED');
    const { tokens } = await oauth2Client.getToken(code);
    return tokens; // { access_token, refresh_token, expiry_date }
  }

  async refreshAccessToken(refreshToken) {
    const oauth2Client = getOAuthClient();
    if (!oauth2Client) throw new Error('GOOGLE_NOT_CONFIGURED');
    const res = await oauth2Client.refreshToken(refreshToken);
    return res.tokens;
  }

  async exportToDrive({ accessToken, refreshToken, contentType, content }) {
    const oauth2Client = getOAuthClient();
    if (!oauth2Client) throw new Error('GOOGLE_NOT_CONFIGURED');
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Prepare folder path: EZTutor / (Lesson Plans|Quizzes) / Subject / Topic
    const top = 'EZTutor';
    const typeFolder = contentType === 'quiz' ? 'Quizzes' : 'Lesson Plans';
    const subject = content.subject || (content.topic || 'General');
    const topic = content.topic || 'General';

    const topId = await ensureFolder(drive, top, null);
    const typeId = await ensureFolder(drive, typeFolder, topId);
    const subjectId = await ensureFolder(drive, subject, typeId);
    const topicId = await ensureFolder(drive, topic, subjectId);

    // Build simple HTML content for the document
    const title = content.title || `${contentType} export`;
    let html = `<h1>${title}</h1>`;
    if (content.description) html += `<p>${content.description}</p>`;
    if (content.objectives && Array.isArray(content.objectives)) {
      html += '<h2>Objectives</h2><ul>' + content.objectives.map(o => `<li>${o}</li>`).join('') + '</ul>';
    }
    if (content.keyPoints && Array.isArray(content.keyPoints)) {
      html += '<h2>Key Points</h2><ul>' + content.keyPoints.map(k => `<li>${k}</li>`).join('') + '</ul>';
    }
    if (content.activities && Array.isArray(content.activities)) {
      html += '<h2>Activities</h2>' + content.activities.map(a => `<p>${a.description || a}</p>`).join('');
    }
    if (content.questions && Array.isArray(content.questions)) {
      html += '<h2>Questions</h2>' + content.questions.map((q,i) => `<p><strong>Q${i+1}.</strong> ${q.text}</p>`).join('');
    }

    // Create Google Doc from HTML
    const fileMetadata = {
      name: title,
      parents: [topicId],
      mimeType: 'application/vnd.google-apps.document',
    };

    const media = {
      mimeType: 'text/html',
      body: html,
    };

    const created = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, webViewLink, name'
    });

    // Attempt to export the created Google Doc to DOCX and upload the DOCX
    try {
      const exportRes = await drive.files.export({
        fileId: created.data.id,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }, { responseType: 'arraybuffer' });

      const buffer = Buffer.from(exportRes.data);
      const docxName = `${title}.docx`;
      const docxCreate = await drive.files.create({
        resource: {
          name: docxName,
          parents: [topicId],
        },
        media: {
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          body: buffer,
        },
        fields: 'id, webViewLink, name'
      });

      return {
        id: created.data.id,
        url: created.data.webViewLink,
        name: created.data.name,
        folderPath: `EZTutor/${typeFolder}/${subject}/${topic}`,
        docxId: docxCreate.data.id,
        docxUrl: docxCreate.data.webViewLink,
      };
    } catch (e) {
      // If export fails, return the Google Doc details as a fallback
      return {
        id: created.data.id,
        url: created.data.webViewLink,
        name: created.data.name,
        folderPath: `EZTutor/${typeFolder}/${subject}/${topic}`,
      };
    }
  }
}

module.exports = new GoogleDriveService();

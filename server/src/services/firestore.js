const admin = require("firebase-admin");
const { Unauthorized } = require("http-errors")
const { NODE_ENV } = process.env


// Instantiates a client. If you don't specify credentials when constructing
// the client, the client library will look for credentials in the
// environment.
admin.initializeApp({
  ...(NODE_ENV === "local" ? {
    credential: admin.credential.cert(require("../../.secrets/service-account.json"))
  } : {})
});

const firestore = admin.firestore()

const TOKEN_COLLECTION = "tokens"
const AUTH_COLLECTION = "auth"

const createStateToken = async (document) => {
  try {
    const newDoc = await firestore.collection(TOKEN_COLLECTION).add(document)
    return newDoc.id
  } catch (error) {
    throw error
  }

}

const getStateTokenById = async (id) => {
  try {
    const docRef = firestore.collection(TOKEN_COLLECTION).doc(id);
    const doc = await docRef.get()
    if (!doc.exists) {
      throw new Unauthorized("state_token_mismatch");
    }
    const { ...data } = doc.data();

    // Delete document after data is read    
    await firestore.collection(TOKEN_COLLECTION).doc(id).delete();

    return data;
  } catch (error) {
    throw error
  }
}

const saveAuth = async (user, origin, encryptedAuth) => {
  const collection = firestore.collection(AUTH_COLLECTION);
  const encodedOrigin = Buffer.from(origin).toString("base64");
  const doc = collection.doc(`${user.id}_${encodedOrigin}`)
  await doc.set({ user, origin, auth: encryptedAuth })
}

const getAuth = async (user, origin) => {
  const collection = firestore.collection(AUTH_COLLECTION);
  const encodedOrigin = Buffer.from(origin).toString("base64");
  const doc = collection.doc(`${user.id}_${encodedOrigin}`)
  const snapshot = await doc.get()
  if (!snapshot.exists) {
    throw new Unauthorized("token_not_found");
  }

  return snapshot.data()
}

module.exports = {
  createStateToken,
  getStateTokenById,
  saveAuth,
  getAuth
}
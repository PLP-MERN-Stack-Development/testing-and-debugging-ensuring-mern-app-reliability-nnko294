# Running tests

Server:

```powershell
cd server
npm install
npm run test:integration
npm run coverage
```

Client:

```powershell
cd client
npm install
npm run test:unit
npm run coverage
```

Notes:
- Server integration tests use an in-memory MongoDB instance via `mongodb-memory-server`.
- If tests fail due to `mongoose.Types.ObjectId()` usage, the repository includes a small compatibility shim in `server/src/app.js`.
- For debugging CI failures, run tests with `--detectOpenHandles` and `--runInBand`.

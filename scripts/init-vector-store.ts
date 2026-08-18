import { ensureCollection } from "../src/mastra";
 
ensureCollection()
  .then(() => {
    console.log("Qdrant collection ready.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
 


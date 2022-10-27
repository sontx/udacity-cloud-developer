import express from 'express';
import bodyParser from 'body-parser';
import {deleteLocalFiles, filterImageFromURL, isValidUrl, sendFile} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get('/filteredimage', async (req: express.Request, res: express.Response) => {
    const image_url: string = req.query.image_url;
    if (!isValidUrl(image_url)) {
      res.status(400).send('image_url must be an invalid url');
    } else {
      try {
        const filteredImagePath = await filterImageFromURL(image_url);
        await sendFile(filteredImagePath, res);
        await deleteLocalFiles([filteredImagePath]);
      } catch (e: any) {
        console.log(e)
        res.status(400).send('Sorry! we cannot process your image: ' + e.message)
      }
    }
  })
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();

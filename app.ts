import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
const router = express.Router();
const app = express();
import bodyParser from 'body-parser';
const fs = require('fs');

app.use(session({ secret: 'secret_key', saveUninitialized: true, resave: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

interface SessionData {
    [key: string]: string;
}

/*
    The middleware function checks whether the session data exist in the request or not.
*/
function authMiddleware(request: Request, response: Response, next: NextFunction) {
    if (request.session && request.session.data) {
        next();
    } else {
        response.send(`<h3>Please set session to access this feature.</h3><a href='/set-session'>Set Session</a>`);
    }
}

/*
@Route '/'
Method get
Default route if the server started on the port 3000.
*/
router.get('/', (request: Request, response: Response, next: NextFunction) => {
    response.write(`<div>`);
    response.write(`<h4>Browse '/set-session' with get method to set the session in req</h4>`);
    response.write(`<a href='/set-session'>Set Session</a>`);
    response.write(`</div>`);
    response.end('');
});

/*
@Route '/set-session'
Method get
This route is used to set sample data in the session request.
*/
router.get('/set-session', (request: Request, response: Response) => {
    if (request.session) {
        request.session.data = 'Sample session data';
        response.write(`<div>`);
        response.write(`<h4>Session data set successfully</h4>`);
        response.write(`</div>`);
        response.end('<a href=' + '/delete-session' + '>Delete Session</a>');
    }
});

/*
@Route '/delete-session'
Method get
This route is used to destroy sample data in the session request.
*/
router.get('/delete-session', (request: Request, response: Response) => {
    if (request.session && request.session.data) {
    request.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        response.redirect('/');
    });
}
});

/*
@Route '/api/proxy/*'
Method get
This route only allows the request to proceed if req has a session and it's applicable only to all URLs that start with
api/proxy (for example api/proxy/adu-ms/get).
*/
router.get('/api/proxy/*', authMiddleware, (request: Request, response: Response, next: NextFunction) => {
    response.write(`<div>`);
    response.write(`<h4>Open Postman with interceptor and browse '/save/:id' with post method and set Cookie data, and pass some JSON to store in the file</h4>`);
    response.write(`</div>`);
    response.end('<a href=' + '/delete-session' + '>Delete Session</a>');
    next();
});

/*
@Route '/pub/proxy/*'
Method get
This route only allows the request to proceed if req has a session and it's applicable only to all URLs that start with
pub/proxy (for example pub/proxy/bpm/start).
*/
router.get('/pub/proxy/*', authMiddleware, (request: Request, response: Response, next: NextFunction) => {
    response.write(`<div>`);
    response.write(`<h4>Open Postman with interceptor and browse '/save/:id' with post method and set Cookie data, and pass some JSON to store in the file</h4>`);
    response.write(`</div>`);
    response.end('<a href=' + '/delete-session' + '>Delete Session</a>');
    next();
});

/*
@Route '/save/:id'
Method post
This route is used to writes contents of request body data that is JSON to file named id.json using post method
*/
router.post('/save/:id', authMiddleware, function (request: Request, response: Response) {
    if (!fs.existsSync(`${__dirname}/data`)) {
        fs.mkdirSync(`${__dirname}/data`);
    }
    fs.writeFile(`${__dirname}/data/${request.params.id}.json`, JSON.stringify(request.body), (err:Error) => {
        if (err) throw err;
        response.status(201).json('The file has been saved successfully!');
    });
});

/*
@Route '/save/:id'
Method get
This route is used to read contents of above created files by id using get method.
*/
router.get('/save/:id', authMiddleware, (request: Request, response: Response) => {
    if (fs.existsSync(`${__dirname}/data/${request.params.id}.json`)) {
        let data = fs.readFileSync(`${__dirname}/data/${request.params.id}.json`);
        response.status(200).json(JSON.parse(data));
    } else {
        response.status(404).json('File not found');
    }
});

app.use('/', router);
app.get('*', function (request: Request, response: Response) {
    response.end('Page not found');
});
app.listen(process.env.PORT || 3000, () => {
    console.log(`App Started on PORT ${process.env.PORT || 3000}`);
});

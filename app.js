const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const cookieParser=require('cookie-parser');
var session = require('express-session');

const app = express();

const port = 6789;

// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false,
	cookie: {
	maxAge: 100000
	}
  }));
  

// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
app.get('/', (req, res) => {
	console.log("cookie: ", req.cookies);
	res.render('index', {username: req.session.username});

});

// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată
let listaIntrebari;
const fs=require('fs');
const { response } = require('express');
const { request } = require('http');
app.get('/chestionar', (req, res) => {
	

	fs.readFile('intrebari.json','utf8',(err,data)=>{

		if(err){
			console.error(err);
			return;
		}
		listaIntrebari=JSON.parse(data);
		res.render('chestionar', {intrebari: listaIntrebari, username: req.session.username});
	});
	// în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care conține vectorul de întrebări
});

app.get('/rezultat-chestionar',(req,res) => {
	res.redirect('/chestionar');
});

app.post('/rezultat-chestionar', (req, res) => {
	var data = req.body;
	var correctAnswers = 0;
	var rasp=[];
	var i=0;

	while(data["question"+i] !== undefined){
		rasp=rasp + data["question"+i] + " ";
		if(data["question"+i] === data["answer"+i])
			correctAnswers++;
		i++;
	}
	var all=0;
	for( var i=1, l=Object.keys(listaIntrebari).length; i<=l; i++){
		all++;
	}
	
	 res.render('rezultat-chestionar',{intrebari:listaIntrebari, correctAnswers, all, rasp, username: req.session.username});

});

app.get('/autentificare',(req,res) => {
	res.clearCookie("mesajEroare"); 
	res.render('autentificare', { mesaj: req.cookies.mesajEroare});
});



app.post('/verificare-autentificare', (req, res) => {

	data = fs.readFileSync('utilizatori.json');
	let listaUtilizatori = JSON.parse(data);

	console.log("USER: ", req.body);
	let username = req.body['username'],
      	password = req.body['password'];
	var utilizator =null;
	for(i=0; i<listaUtilizatori.length;i++){
		if(listaUtilizatori[i].utilizator == username){
			utilizator = listaUtilizatori[i];
			break;
		  }
	}
	if(utilizator!=null && password == utilizator.parola){
		res.cookie("numeUtilizator", utilizator.prenume);
		req.session.username = username;
		res.redirect('/');
	  }
	else{
        res.cookie("mesajEroare", "Incorrect Username and/or Password!");
        res.redirect('/autentificare');
      }

});


app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`+port));
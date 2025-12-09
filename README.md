# polyfestival.back

## Using Docker Compose
### Dev Mode
```sh
docker-compose -f docker-compose-back.yml up --build
```
Back Running on http://localhost:3000
Database running on localhost:5432

### Production mode :
*Work in progress*

## Without Docker Compose
To install dependencies:
```bash
npm install
```

To run:
```bash
npm run dev
```
**Warning** : There is no database using this method, you have to initialize it manually by using this method !


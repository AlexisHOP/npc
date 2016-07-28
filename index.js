const fs = require('fs');
const cp = require('child_process');
const readline = require('readline');
const RegistryClient = require('npm-registry-client');

const argv = require('minimist')(process.argv.slice(2));
const len = argv.l
console.log(argv.start)

const rl = readline.createInterface({
  input: fs.createReadStream('20k.txt')
});

let no = 0
let count = 0
const words = []
rl.on('line', (line) => {
  no++
  if (line.trim().length === len) {
	// console.log(`Line ${no} from file:`, line, ++count);
	words.push(line);
  }
});

const client = new RegistryClient()
const threadsCount = 10
const threads = []
rl.on('close', () => {
  console.log('heiyo', len, words.length)
  
  // createLookupPromise(words[0])
  start(words).then(() => {
	console.log(unused)
  })
})

const unused = []
function createLookupPromise (name) {
  return new Promise(function (resolve, reject) {
    cp.exec(`npm v ${name} description`, {}, (err, stdout, stderr) => {
	  if (err) {
		resolve(name)
	  }
	  
	  stdout && process.stdout.write(`${name}, `)
	  stderr && unused.push(name) && console.log(`\n\n-----!! ${name}\n`)
	  
	  resolve(name)
    })
  })
}

function start (words) {
  let ignore = argv.start !== undefined
  return words.reduce(function (promise, word) {
	return promise.then((last) => {
	  ignore && (ignore = argv.start !== word)
	  if (argv.start && ignore) {
		return Promise.resolve(word)
	  }
	  return createLookupPromise(word)
    })
  }, Promise.resolve())
}

// Catches ctrl+c event
process.on('SIGINT', err => {
  if (err) {
	console.log('PROCESS ERR:', err)
	return
  }
  console.log('checked:', unused.join(', '))
  process.exit()
})

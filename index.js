const fs = require('fs')
const cp = require('child_process')
const readline = require('readline')

const argv = require('minimist')(process.argv.slice(2))
const len = argv.l || 5
const startWord = argv.start || ''

const rl = readline.createInterface({
  input: fs.createReadStream('20k.txt')
})

let no = 0
let count = 0
const words = []
rl.on('line', (line) => {
  no++
  if (line.trim().length === len) {
    count++
    // console.log(`Line ${no} from file:`, line, count)
    words.push(line)
  }
})

const threadsCount = 10
const threads = []
rl.on('close', () => {
  console.log(
    `==> ${len} chars words, ${words.length} in total.`,
    startWord && `start from ${startWord}.`
  )

  // createLookupPromise(words[0])
  start(words).then(logResult)
})

const unused = []
function createLookupPromise (name, counter) {
  return new Promise(function (resolve, reject) {
    cp.exec(`npm v ${name} description`, {}, (err, stdout, stderr) => {
      if (err) {
        resolve(name)
      }

      stdout && process.stdout.write(`${name}(${counter}), `)
      stderr && unused.push(name) && process.stdout.write(`\x1b[1;37;42m ${name} \x1b[0m, `)

      resolve(name)
    })
  })
}

function start (words) {
  process.stdout.write('\nStart checking: ')
  let ignore = argv.start !== undefined
  let counter = 0
  return words.reduce(function (promise, word) {
    return promise.then((last) => {
      ignore && (ignore = argv.start !== word)
      if (argv.start && ignore) {
        return Promise.resolve(word)
      }
      return createLookupPromise(word, ++counter)
    })
  }, Promise.resolve())
}

// Catches ctrl+c event
process.on('SIGINT', err => {
  if (err) {
    console.log('PROCESS ERR:', err)
    return
  }
  logResult()
  process.exit()
})

function logResult () {
  console.log('\n\nFound these:', unused.join(', '))
}

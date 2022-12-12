const fs = require('fs')
const path = require('path')

const htmlTextRegex = /<[^>]*>(.*?)<\/[^>]*>/g

function replaceTextUInDirectory(wordReplacements, topDirectory) {
  const wordsToBeReplaced = Object.keys(wordReplacements)

  function getReplacement(string) {
    return `{{ '${string}' | cxTranslate }}`
  }

  function isValidFile() {
    return file.endsWith('.html')
  }

  function matchStringsBetweenTags(string) {
    const regex = htmlTextRegex
    const matches = []

    let match = regex.exec(string)
    while (match) {
      matches.push(match[1])
      match = regex.exec(string)
    }

    return matches
  }

  function intersection(arr1, arr2) {
    // Create a set from the second array to improve performance
    const set = new Set(arr2.map((x) => x.toLowerCase()))

    // Use filter() to only keep the elements that exist in both arrays,
    // after converting them to lower case to ignore the case
    return arr1.filter((x) => set.has(x.toLowerCase()))
  }

  function readDirectoryRecursive(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const filePath = path.join(dir, file)
      const fileStat = fs.statSync(filePath)

      if (fileStat.isDirectory()) {
        // Recursively read files in subdirectory
        return readDirectoryRecursive(filePath)
      }

      if (!isValidFile()) return

      const fileContent = fs.readFileSync(filePath, 'utf8')
      // Get matches
      const matches = matchStringsBetweenTags(fileContent)
      // Get words to be replaced and case insensitive reges
      const wordsFoundForReplacement = intersection(wordsToBeReplaced, matches)
      if (!wordsFoundForReplacement?.length) return
      const regexes = wordsFoundForReplacement.map((word) => new RegExp(word, 'gi'))

      // Replace
      const newData = regexes.reduce((result, regex, index) => {
        // Get replacement text
        const key = wordsFoundForReplacement[index]
        const replacement = getReplacement(wordReplacements[key])

        // Get all inner html content
        const matches = result.match(htmlTextRegex)
        return matches
          .map((match) => {
            // Match the text and replace it with the replacement string
            const replaced = match.replace(regex, replacement)
            return result.replace(match, replaced)
          })
          .join('')
      }, fileContent)

      fs.writeFile(filePath, newData, (err) => {
        if (err) throw err
      })
    })
  }

  readDirectoryRecursive(topDirectory)
}

// Example:

const wordReplacements = {
  'An example': 'lala.anExample',
  Save: 'save.save',
  div: 'div.div',
}

replaceTextUInDirectory(wordReplacements, __dirname)

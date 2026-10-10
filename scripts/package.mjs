import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { zipSync } from 'fflate'

const directory = 'plugins/global-badges'
const manifest = JSON.parse(readFileSync(`${directory}/manifest.json`, 'utf8'))
const script = manifest.dist.script
const output = `build/dist/${manifest.id}@${manifest.version}.zip`

mkdirSync('build/dist', { recursive: true })
writeFileSync(
	output,
	zipSync({
		'manifest.json': readFileSync(`${directory}/manifest.json`),
		[script]: readFileSync(`${directory}/build/js/${script}`),
	}),
)
console.log(`Packaged ${output}`)

import { readdir, readFile } from 'fs/promises'
import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'

export default async function extensionHostWorker(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const root = process.env.PROJECT_ROOT
    if (!root) throw new Error('PROJECT_ROOT not set')
    const workerPath = path.join(root, '.next/static/chunks/vscode/')

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    res.statusCode = 200
    const files = await readdir(workerPath)
    res.write((await readFile(path.join(workerPath, files[0]))).toString())
    res.end()
}

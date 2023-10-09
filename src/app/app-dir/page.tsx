import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('../../lib'), { ssr: false })

export default function Home() {
    return <Editor />
}

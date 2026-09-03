import AiEvaluationPanel from '../components/AiEvaluationPanel'

export default function AiPage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">AI Baholash</h1>
      </div>
      <AiEvaluationPanel />
    </div>
  )
}

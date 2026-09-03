import { X } from 'lucide-react'
import AiEvaluationPanel from './AiEvaluationPanel'

export default function AiEvaluationModal({ orderNum, applicantName, fileUrl, onClose, onAccept, onReject }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6 bg-black/50" onClick={onClose}>
      <div className="bg-slate-50 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="min-w-0">
            <h2 className="font-bold text-slate-800 text-sm">AI Baholash — Ariza №{orderNum}</h2>
            {applicantName && <p className="text-xs text-slate-500 truncate mt-0.5">{applicantName}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">
          <AiEvaluationPanel initialLink={fileUrl ?? ''} autoStart={!!fileUrl}
            onAccept={(result) => { onAccept?.(result); onClose() }}
            onReject={(result) => { onReject?.(result); onClose() }} />
        </div>
      </div>
    </div>
  )
}

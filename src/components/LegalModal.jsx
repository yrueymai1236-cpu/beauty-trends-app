import React from 'react';

const LegalModal = ({ type, isOpen, onClose }) => {
  if (!isOpen || !type) return null;

  const isTerms = type === 'terms';
  const title = isTerms ? '利用規約' : 'プライバシーポリシー';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-content animate-fade-in" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{title}</h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer', 
              color: 'var(--text-secondary)' 
            }}
          >
            ×
          </button>
        </div>

        <div style={{ 
          padding: '24px', 
          overflowY: 'auto', 
          fontSize: '13px', 
          lineHeight: '1.7', 
          color: 'var(--text-primary)',
          flex: 1
        }}>
          {isTerms ? (
            <div>
              <p>本規約は、最新コスメトレンド情報アプリ「TrendGlow」（以下「当サービス」）の利用条件を定めるものです。</p>
              
              <h3 style={{ fontSize: '14px', marginTop: '20px', marginBottom: '8px', fontWeight: 600 }}>第1条（サービス概要）</h3>
              <p>当サービスは、SNS等の公開情報を基にしたコスメトレンド情報の掲載、AIチャットによる美容相談、およびWebプッシュ通知機能を提供する無料のプラットフォームです。</p>

              <h3 style={{ fontSize: '14px', marginTop: '20px', marginBottom: '8px', fontWeight: 600 }}>第2条（免責事項）</h3>
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                <li>当サービス内の情報およびAIチャットボットによる返答は、一般的なトレンドの紹介や参考情報の提供のみを目的としております。医学的、薬学的、または皮膚科等の専門的な診断・アドバイスに代わるものではありません。</li>
                <li>紹介されている化粧品の使用に際しては、ご自身の判断でパッチテストを行うなど、安全に十分配慮してご使用ください。万一、肌荒れ等のトラブルが生じた場合、当サービスは一切の責任を負いません。</li>
                <li>当サービスからリンクされている外部ECサイト（楽天市場、Yahoo!ショッピング等）における商品の購入および取引は、ユーザーと当該販売店との間で直接行われるものであり、当サービスは取引に関わる一切の責任を負いません。</li>
              </ol>

              <h3 style={{ fontSize: '14px', marginTop: '20px', marginBottom: '8px', fontWeight: 600 }}>第3条（サービスの変更・中断・終了）</h3>
              <p>当サービスは、ユーザーに事前に通知することなく、当サービスの内容を変更、中断、または終了することができるものとします。</p>

              <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontSize: '12px' }}>制定日：2026年7月8日</p>
            </div>
          ) : (
            <div>
              <p>当サービスは、ユーザーのプライバシーの保護に努めます。当サービスにおける情報の取り扱いについて以下のように定めます。</p>

              <h3 style={{ fontSize: '14px', marginTop: '20px', marginBottom: '8px', fontWeight: 600 }}>第1条（収集する情報およびその利用目的）</h3>
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                <li><strong>プッシュ通知の購読情報:</strong> Webプッシュ通知の配信を許可された場合、配信に必要なエンドポイント情報をサーバーに保存します。この情報はプッシュ通知の配信目的以外には一切使用しません。</li>
                <li><strong>ローカルキャッシュ（localStorage）:</strong> 表示の高速化およびお気に入り機能の保存のため、ブラウザのローカルストレージを使用します。これらはユーザーの端末内に閉じて保存され、サーバーへ不必要に送信されることはありません。また、個人を特定する情報は一切含まれません。</li>
              </ol>

              <h3 style={{ fontSize: '14px', marginTop: '20px', marginBottom: '8px', fontWeight: 600 }}>第2条（第三者への提供）</h3>
              <p>当サービスは、法令に基づく場合を除き、収集した情報をユーザーの同意なしに第三者に提供することはありません。</p>

              <h3 style={{ fontSize: '14px', marginTop: '20px', marginBottom: '8px', fontWeight: 600 }}>第3条（外部リンク先におけるプライバシー）</h3>
              <p>当サービスに掲載されているリンクからアクセスできる外部ECサイト等において収集される個人情報の取り扱いについては、当サービスは一切責任を負いません。遷移先のプライバシーポリシーをご確認ください。</p>

              <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontSize: '12px' }}>制定日：2026年7月8日</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalModal;

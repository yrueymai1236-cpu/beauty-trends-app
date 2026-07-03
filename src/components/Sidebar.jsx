import React from 'react';
import './Sidebar.css';

const knowledgeData = {
  "すべて": {
    title: "美容マメ知識\n〜今月のトレンド傾向〜",
    items: [
      {
        icon: "🌟",
        name: "パーソナルカラー重視",
        desc: "イエベ・ブルベに合わせた色展開をするブランドが急増中！自分に合う色選びがトレンドの基本です。"
      },
      {
        icon: "⏱️",
        name: "時短＆多機能",
        desc: "「下地＋日焼け止め＋ファンデ」のようなオールインワンコスメが大人気。忙しい朝の強い味方です。"
      },
      {
        icon: "🤍",
        name: "ジェンダーレス美容",
        desc: "性別問わず使えるシンプルなパッケージと処方のスキンケアがトレンド。パートナーとシェアする人も増えています。"
      }
    ]
  },
  "スキンケア": {
    title: "美容マメ知識\n〜保湿成分編〜",
    items: [
      {
        icon: "💧",
        name: "ヒアルロン酸・コラーゲン",
        desc: "肌の表面から角質層まで潤いをキープ。乾燥肌の強い味方で、プルプルの肌を保ちます。"
      },
      {
        icon: "🛡️",
        name: "セラミド",
        desc: "肌のバリア機能を高め、外部刺激から守る最重要保湿成分。敏感肌の方に特におすすめです。"
      },
      {
        icon: "🍋",
        name: "ビタミンC・レチノール",
        desc: "毛穴やハリ不足にアプローチする、攻めのエイジングケア成分。夜のスキンケアに取り入れるのがトレンド。"
      }
    ]
  },
  "メイクアップ": {
    title: "美容マメ知識\n〜トレンドメイク編〜",
    items: [
      {
        icon: "✨",
        name: "ツヤ肌ベースメイク",
        desc: "保湿力の高い下地と、パール配合のハイライトで内側から発光するような肌に仕上げるのが今どき。"
      },
      {
        icon: "💄",
        name: "落ちないティントリップ",
        desc: "マスクや食事でも色落ちしにくい処方がマスト。乾燥を防ぐ保湿成分入りを選ぶのがポイントです。"
      },
      {
        icon: "👁️",
        name: "抜け感アイメイク",
        desc: "肌なじみの良いブラウンやテラコッタで、作り込みすぎない自然なデカ目を演出するのがトレンド。"
      }
    ]
  },
  "ヘアケア": {
    title: "美容マメ知識\n〜シャンプー成分編〜",
    items: [
      {
        icon: "💧",
        name: "アミノ酸系洗浄成分",
        desc: "「ココイル〜」や「ラウロイル〜」といった成分。頭皮や髪と同じタンパク質由来で、マイルドに洗い上げます。"
      },
      {
        icon: "🛡️",
        name: "ケラチン・ヘマチン",
        desc: "ダメージを受けた髪の内部を補修し、ハリ・コシを与えます。カラーやパーマをしている方に特におすすめ。"
      },
      {
        icon: "🌿",
        name: "セラミド・植物由来オイル",
        desc: "アルガンオイルなどの自然由来オイルやセラミドが、パサつく髪をしっかり保湿。自然なツヤをプラスします。"
      }
    ]
  }
};

const Sidebar = ({ activeCategory }) => {
  const data = knowledgeData[activeCategory] || knowledgeData["すべて"];

  return (
    <aside className="sidebar-container">
      <div className="knowledge-card animate-fade-in" key={activeCategory}>
        <div className="knowledge-header">
          <span className="knowledge-icon">✨</span>
          <h2 className="knowledge-title" style={{ whiteSpace: 'pre-line' }}>{data.title}</h2>
        </div>
        
        <div className="knowledge-list">
          {data.items.map((item, index) => (
            <div className="ingredient-item" key={index}>
              <h3 className="ingredient-name">
                <span>{item.icon}</span> {item.name}
              </h3>
              <p className="ingredient-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

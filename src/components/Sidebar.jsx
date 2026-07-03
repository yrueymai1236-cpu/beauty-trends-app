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
  },
  "ボディケア": {
    title: "美容マメ知識\n〜ボディケアのコツ〜",
    items: [
      {
        icon: "🛁",
        name: "お風呂上がりの3分が勝負",
        desc: "お風呂から上がった直後から肌の乾燥は始まります。タオルで軽く拭いたら、すぐにボディクリームを塗るのが鉄則です。"
      },
      {
        icon: "✨",
        name: "スクラブは週1〜2回",
        desc: "ひじやかかとなど、角質が硬くなりやすい部分はスクラブで優しくオフ。その後の保湿剤の浸透が格段に良くなります。"
      },
      {
        icon: "🩸",
        name: "マッサージで血行促進",
        desc: "ボディオイルやクリームを塗るついでに、足首からふくらはぎへ下から上にマッサージすると、むくみもスッキリします。"
      }
    ]
  },
  "フレグランス": {
    title: "美容マメ知識\n〜香水のまとい方〜",
    items: [
      {
        icon: "🌬️",
        name: "つける場所で香りが変わる",
        desc: "手首や首筋などの「脈打つ場所」は香りが強く立ち、足首やウエストなど「下半身」はふんわり優しく香ります。"
      },
      {
        icon: "❌",
        name: "こすり合わせるのはNG",
        desc: "手首につけた後こすり合わせると、香りの粒子が壊れて本来の香りが変わってしまいます。トントンと軽く乗せるのが正解。"
      },
      {
        icon: "☁️",
        name: "空間にシュッとする",
        desc: "空中にワンプッシュし、その下をくぐり抜けるように香りをまとうと、全身からごく自然に良い香りが漂います。"
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

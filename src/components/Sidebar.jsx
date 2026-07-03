import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar-container">
      <div className="knowledge-card animate-fade-in">
        <div className="knowledge-header">
          <span className="knowledge-icon">✨</span>
          <h2 className="knowledge-title">美容マメ知識<br/>〜シャンプー成分編〜</h2>
        </div>
        
        <div className="knowledge-list">
          <div className="ingredient-item">
            <h3 className="ingredient-name">
              <span>💧</span> アミノ酸系洗浄成分
            </h3>
            <p className="ingredient-desc">
              「ココイル〜」や「ラウロイル〜」といった成分。頭皮や髪と同じタンパク質由来で、潤いを残しながらマイルドに洗い上げます。
            </p>
          </div>

          <div className="ingredient-item">
            <h3 className="ingredient-name">
              <span>🛡️</span> ケラチン・ヘマチン
            </h3>
            <p className="ingredient-desc">
              ダメージを受けた髪の内部を補修し、ハリ・コシを与えます。カラーやパーマをしている方に特におすすめの成分です。
            </p>
          </div>

          <div className="ingredient-item">
            <h3 className="ingredient-name">
              <span>🌿</span> セラミド・植物由来オイル
            </h3>
            <p className="ingredient-desc">
              アルガンオイルなどの自然由来オイルやセラミドが、パサつく髪と頭皮をしっかり保湿。自然なツヤとなめらかさをプラスします。
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

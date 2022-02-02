import type { BaseTranslation } from "../i18n-types"

const ja: BaseTranslation = {
	editor: {
		menu: {
			file: "ファイル (&F)",
			library: "素材集 (&L)",
			edit: "編集 (&E)",
			preferences: "設定 (&P)",
			help: "ヘルプ (&H)",
			new: "新規 (&N)",
			open: "開く (&O)",
			save: "譜面保存 (&S)",
			image: "画像出力 (&I)",
			undo: "元に戻す (&U)",
			redo: "やり直し (&R)",
			selectall: "すべて選択 (&A)",
			unselectall: "選択解除 (&U)",
			cut: "切り取り (&X)",
			copy: "コピー (&C)",
			paste: "貼り付け (&P)",
			flippaste: "反転貼り付け (&F)",
			listall: "一覧 (&A)",
			upload: "追加 (&U)",
			language: "言語 (&G)",
			rename: 'リネーム (&R)',
			delete: '削除 (&D)',
			deleteall: 'すべて削除 (&A)',
			duplicate: "複製 (&D)",
			flip: "左右反転 (&H)",
			straight: "直線 (&S)",
			curvein: "加速 (&I)",
			curveout: "減速 (&O)",
			visible: "可視 (&B)",
			invisible: "不可視 (&N)",
			ignored: "無視 (&G)",
			shrink: "縮める (&K)",
			download: "ダウンロード (&U)",
			divide: "分割 (&V)",
			combine: "結合 (&B)",
			toslide: "スライドに変換 (&S)",
			tostream: "ストリームに変換 (&T)",
			about: "バージョン情報 (&A)",
		},
		menuDescription: {
			new: "新規譜面を作成",
			open: "譜面一覧を開く",
			save: "SUSファイルに出力",
			image: "譜面の画像化",
			undo: "前の操作を取り消す",
			redo: "取り消した操作をやり直す",
			selectall: "すべてのノーツを選択"
		},
		panel: {
			measure: "（小節）",
			totalcombo: "合計コンボ",
			totalselected: "選択された",
			skipstart: "頭出し",
			playpause: "再生／一時停止",
			skipback: "戻る",
			scrollmode: "スクロール方式",
			metadata: "基本情報",
			title: "タイトル",
			artist: "アーティスト",
			author: "譜面作者",
			statistics: "統計",
			history: "履歴",
			undo: "元に戻す",
			redo: "やり直し",
			open: "開く",
			master: "マスター音量",
			sfxvolume: "SE 音量",
			music: "音楽情報",
			musicfile: "音楽ファイル",
			control: "コントロール",
			updatedTime: "更新時刻",
			offset: 'オフセット',
			seconds: '秒',
			visibility: {
				taps: 'タップ',
				flicks: 'フリック',
				slides: 'スライド',
				slidesteps: '中継点',
				all: 'すべて',
			}
		},
		scrollmode: {
			page: "上下スクロール",
			smooth: "固定スクロール",
			none: "スクロールしない",
		},
		messages: {
			nonNumeralInputError: "数値を入力してください",
			outOfRangeInputError: "{from:number}から{to:number}までの数値を入力してください",
			projectSavedAs: "{project:string} として保存されました。",
			loadingSUSSuccess: "SUSファイル {filename:string} を読み込みました",
			loadingSUSError: "SUSファイルを読み込む際にエラーが発生しました",
			autoSaved: "譜面が自動保存されました",
			saved: "譜面が保存されました",
			inputTitlePrompt: "タイトルを入力してください",
			inputDescriptionPrompt: "説明を入力してください",
			inputEmptyError: "タイトルや説明を入力してください",
			exitConfirm: "本当にエディターを閉じますか",
			unknownFileType: "不明なファイルタイプです",
			preferencesSaved: '設定を保存しました',
			deleteConfirm: '本当に削除しますか？',
			confirmBPMDetected: '楽曲のBPMが検出されました。BPMを{bpm:number}に変更しますか？',
			nothingToUndo: '元に戻す操作はもうありません',
			nothingToRedo: 'やり直す操作はもうありません',
			projectDeleted: '譜面 {name:string} を削除しました',
			noProjectOpened: '開かれている譜面はありません',
			library: {
				loadingFailed: '素材集の読み込みに失敗しました。',
				uploadTooLongConfirm: '素材集に追加しようとするノーツが 20 を超えています。本当に追加しますか？\n\n⚠素材集は譜面をアップロードする所ではないため、フル尺の譜面を追加しないでください！⚠\n譜面をアップロードするには、「ヘルプ」をご参照ください。',
				uploadNotSelectedError: '素材集に追加するノーツが選択されていません',
				uploadSuccess: '素材を追加しました',
				uploadFailed: '素材の追加が失敗しました',
			}
		},
		snapTo: {
			snap: "{n:number}分音符",
			snapWithRange: "分音符（1 ~ 1920）",
			custom: "カスタム"
		},
		mutation: {
			update: "更新",
			append: '追加',
			cut: "カット",
			delete: "削除",
			set: "設定",
			flip: "反転",
			move: "移動",
			resize: "リサイズ",
			paste: "貼り付け",
			divide: '分割',
			combine: '結合',
			convert: '変換',
			message: "{amount:number} {type: string}を{operation: string}",
			target: {
				note: "ノーツ",
				slide: "スライド",
				slidenote: "スライドノート",
				timeSignature: "拍子",
				bpm: "BPM",
			}
		},
		dialog: {
			bpmTitle: "BPM設定",
			timeSignatureTitle: "拍子設定",
			customSnappingTitle: "カスタム分音符",
			imageTitle: "画像出力",
			libraryTitle: "素材集",
			preferencesTitle: '環境設定',
			projectsTitle: '譜面一覧',
			append: "追加",
			change: "変更",
			export: "出力",
			delete: "削除",
			ok: "OK",
			new: '新規作成',
			opensus: 'SUSファイルを開く',
			about: 'PaletteWorks Editor について',
		},
		preferences: {
			autosaveInterval: '自動保存の間隔（秒）',
			scrollSpeed: 'スクロールの早さ（倍）',
			laneWidth: 'レーンの幅',
			noteHeight: 'ノーツの高さ',
			minimapEnabled: 'ミニマップ（プレビュー表示）を表示する',
		},
		modes: {
			select: "選択",
			tap: "タップ",
			slide: "スライド",
			mid: "中継点",
			flick: "フリック",
			critical: "クリティカル",
			bpm: "BPM",
			timeSignature: "拍子",
		}
	}
}

export default ja

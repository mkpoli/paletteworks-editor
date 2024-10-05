import type { Translation } from '../i18n-types'

const zh: Translation = {
  editor: {
    menu: {
      file: '文檔 (&F)',
      library: '梗庫 (&L)',
      edit: '編緝 (&E)',
      preferences: '設定 (&P)',
      help: '幫助 (&H)',
      new: '新建 (&N)',
      open: '打開 (&O)',
      save: '保存譜面 (&S)',
      image: '導出圖片 (&I)',
      undo: '撤銷 (&U)',
      redo: '重做 (&R)',
      selectall: '全選 (&A)',
      unselectall: '取消選擇 (&U)',
      cut: '剪切 (&X)',
      copy: '複製 (&C)',
      paste: '粘貼 (&V)',
      flippaste: '翻轉粘貼 (&F)',
      listall: '一覽 (&A)',
      upload: '上傳 (&U)',
      language: '語言 (&G)',
      rename: '重命名 (&R)',
      delete: '刪除 (&D)',
      deleteall: '刪除全部 (&D)',
      duplicate: '創建副本（&U)',
      flip: '水平翻轉 (&F)',
      vflip: '垂直翻轉 (&V)',
      straight: '直線 (&S)',
      curvein: '加速 (&I)',
      curveout: '減速 (&O)',
      visible: '可見 (&B)',
      invisible: '隱藏 (&N)',
      ignored: '無視 (&G)',
      shrink: '縮短 (&K)',
      download: '下載 (&D)',
      divide: '分割 (&V)',
      combine: '合併 (&B)',
      toslide: '轉換爲長條 (&S)',
      tostream: '轉換爲連打 (&T)',
      about: '關於 (&A)',
      export: '導出 (&E)',
      detectBPM: '檢測 BPM (&B)',
      fixTick: '修正時刻 (&F)',
    },
    menuDescription: {
      new: '創建新譜面',
      open: '打開譜面',
      save: '保存爲 .sus 檔',
      image: '導出爲圖片',
      undo: '撤銷上一個操作',
      redo: '重做上一個操作',
      selectall: '選擇全部的音符',
    },
    panel: {
      measure: '(小節)',
      totalcombo: '總 COMBO',
      totalselected: '選擇音符數',
      skipstart: '重播',
      playpause: '播放/暫停',
      skipback: '返回',
      scrollmode: '滾動方式',
      metadata: '譜面資訊',
      title: '標題',
      artist: '音樂作者',
      author: '譜面作者',
      statistics: '統計',
      history: '歷史',
      undo: '撤銷',
      redo: '重做',
      open: '打開',
      master: '主音量',
      sfxvolume: '音效',
      music: '音頻面板',
      musicfile: '音樂文檔',
      control: '控制面板',
      updatedTime: '最後更新',
      offset: '時間偏移',
      seconds: '秒',
      visibility: {
        taps: '單擊',
        flicks: '劃鍵',
        slides: '長條',
        slidesteps: '中繼點',
        all: '全部',
      },
    },
    scrollmode: {
      page: '翻頁',
      smooth: '電影',
      none: '無',
    },
    messages: {
      nonNumeralInputError: '請輸入數字',
      outOfRangeInputError: '請輸入{from}到{to}的數字',
      projectSavedAs: '項目成功保存爲{project}',
      loadingSUSSuccess: '成功載入.sus文檔 {filename}',
      loadingSUSError: '載入.sus文檔時出錯',
      autoSaved: '已自動保存',
      saved: '保存成功',
      inputTitlePrompt: '請輸入標題',
      inputDescriptionPrompt: '請輸入描述',
      inputEmptyError: '請輸入標題和描述',
      exitConfirm: '您確定要退出嗎？',
      unknownFileType: '未知的文檔類型',
      preferencesSaved: '設定已保存',
      deleteConfirm: '您確定要刪除嗎？',
      confirmBPMDetected:
        '檢測到樂曲的BPM。是否要把BPM改爲{bpm}？\n\n※ BPM 自動檢測只會檢測 90-180 範圍內的 BPM，且可能不準確。同時，也沒有考慮 BPM 變化，因此僅供參考。',
      nothingToUndo: '沒有可撤銷的操作',
      nothingToRedo: '沒有可重做的操作',
      projectDeleted: '譜面 {name} 已刪除',
      noProjectOpened: '沒有打開的譜面',
      confirm: '您真的確定嗎？',
      database: {
        confirmImport: '您確定要導入資料庫嗎？所有的資料將被覆蓋。',
        importSuccess: '資料庫導入成功',
        importFailed: '資料庫導入失敗',
        exportSuccess: '資料庫導出成功',
        exportFailed: '資料庫導出失敗',
      },
      library: {
        loadingFailed: '載入梗庫時出錯',
        uploadTooLongConfirm:
          '要上傳到梗庫的音符數量超過 20。您確定要上傳嗎？\n\n⚠梗庫不是上傳譜面的地方、請不要把完整譜面上傳到這裏！⚠\n如果您想上傳譜面，請參考「幫助」。',
        uploadNotSelectedError: '請先選擇要上傳的音符',
        uploadSuccess: '上傳成功',
        uploadFailed: '上傳失敗',
      },
      project: {
        importSuccess: '譜面「{name}」導入成功',
        importFailed: '譜面導入失敗',
      },
      noteError: {
        stacked: '音符在同一個時刻上重疊，請選擇它們然後使用「縮短」',
        warning: '音符位置不正確，請調整它們',
        corrupted: '音符被非整數時刻損壞，請選擇它們然後使用「修正時刻」',
        multiTap: '檢測到三點以上同時點擊，請調整或關閉設定中的多點擊警告',
      },
      corruptedNotes:
        '{measures} 小節附近有損壞的非整數時刻音符，請選擇它們然後使用「修正時刻」',
    },
    mutation: {
      update: '更新',
      append: '添加',
      cut: '剪切',
      delete: '刪除',
      flip: '翻轉',
      move: '移動',
      set: '設置',
      resize: '調整大小',
      paste: '粘貼',
      divide: '分割',
      combine: '合併',
      convert: '轉換',
      message: '{operation}了 {amount} 個{type}',
      target: {
        note: '音符',
        slide: '長條',
        slidenote: '長條音符',
        timeSignature: '拍號',
        bpm: 'BPM',
      },
    },
    snapTo: {
      snap: '{n}分音符',
      custom: '自定義',
      snapWithRange: '分割 (1 ~ 1920)',
    },
    dialog: {
      bpmTitle: '設置BPM',
      timeSignatureTitle: '設置拍號',
      customSnappingTitle: '設置自定義分割',
      imageTitle: '導出圖片',
      libraryTitle: '梗庫',
      preferencesTitle: '設定',
      projectsTitle: '譜面一覽',
      append: '添加',
      change: '更改',
      export: '導出',
      delete: '刪除',
      ok: '確定',
      new: '新建',
      openscore: '打開譜面文件',
      about: '關於 PaletteWorks Editor',
    },
    preferences: {
      autosaveInterval: '自動保存間隔（秒)',
      scrollSpeed: '滾動速度（倍）',
      laneWidth: '軌道寬度',
      noteHeight: '音符高度',
      minimapEnabled: '啓用小地圖（預覽）',
      multiTapWarningEnabled: '啓用三點以上同時點擊警告',
      fileSaveName: '譜面文件名',
      fileSaveNameTooltip: '目前可以使用的關鍵字如下',
      autoDetectBPM: '自動檢測 BPM',
    },
    modes: {
      select: '選擇',
      tap: '單擊',
      slide: '長條',
      mid: '中繼點',
      flick: '劃鍵',
      critical: '黃鍵',
      bpm: 'BPM',
      timeSignature: '拍號',
    },
  },
}

export default zh

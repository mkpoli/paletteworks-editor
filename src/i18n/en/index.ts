import type { Translation } from '../i18n-types'

const en: Translation = {
  editor: {
    menu: {
      file: '&Files',
      library: '&Library',
      edit: '&Edit',
      preferences: '&Preferences',
      help: '&Help',
      new: '&New',
      open: '&Open',
      save: '&Save Score',
      image: '&Export Image',
      undo: '&Undo',
      redo: '&Redo',
      selectall: 'Select &All',
      unselectall: '&Unselect All',
      cut: 'Cu&t',
      copy: '&Copy',
      paste: '&Paste',
      flippaste: '&Flip Paste',
      listall: 'List &All',
      upload: '&Upload',
      language: 'Lan&guage',
      rename: '&Rename',
      delete: '&Delete',
      deleteall: '&Delete All',
      duplicate: 'D&uplicate',
      flip: 'Horizontal &Flip',
      vflip: 'Ve&rtical Flip',
      straight: '&Straight',
      curvein: 'Curve &In',
      curveout: 'Curve &Out',
      visible: 'Visi&ble',
      invisible: 'I&nvisible',
      ignored: 'I&gnored',
      shrink: 'Shrin&k',
      download: 'Do&wnload',
      divide: 'Di&vide',
      combine: 'Com&bine',
      toslide: 'To &Slide',
      tostream: 'To S&tream',
      about: '&About',
      export: '&Export',
      detectBPM: 'Detect &BPM',
    },
    menuDescription: {
      new: 'Create a new score',
      open: 'Open a score',
      save: 'Save the score as .sus file',
      image: 'Export the score as an image',
      undo: 'Undo the last action',
      redo: 'Redo the last action',
      selectall: 'Select all notes',
    },
    panel: {
      measure: '(Bar)',
      totalcombo: 'Combos',
      totalselected: 'Selected',
      skipstart: 'Previous',
      playpause: 'Play/Pause',
      skipback: 'Back',
      scrollmode: 'Scroll Mode',
      metadata: 'Metadata',
      title: 'Title',
      artist: 'Artist',
      author: 'Author',
      statistics: 'Statistics',
      history: 'History',
      undo: 'Undo',
      redo: 'Redo',
      open: 'Open',
      master: 'Master Volume',
      sfxvolume: 'SFX Volume',
      music: 'Audio',
      musicfile: 'Music File',
      control: 'Controls',
      updatedTime: 'Last Updated',
      offset: 'Offset',
      seconds: 'secs',
      visibility: {
        taps: 'Taps',
        flicks: 'Flicks',
        slides: 'Slides',
        slidesteps: 'Steps',
        all: 'All',
      },
    },
    scrollmode: {
      page: 'Page Up/Down',
      smooth: 'Smooth Scroll',
      none: 'No Scroll',
    },
    messages: {
      nonNumeralInputError: 'Please enter a number',
      outOfRangeInputError: 'Please enter a number between {from} and {to}',
      projectSavedAs: 'Project saved as {project}',
      loadingSUSSuccess: 'Successfully loaded .sus file: {filename}',
      loadingSUSError: 'Error loading .sus file',
      autoSaved: 'Auto-saved',
      saved: 'The score is successfully saved',
      inputTitlePrompt: 'Please enter a title',
      inputDescriptionPrompt: 'Please enter a description',
      inputEmptyError: 'Please enter both a title and a description',
      exitConfirm: 'Do you want to save the score before exiting?',
      unknownFileType: 'Unknown file type',
      preferencesSaved: 'Preferences saved',
      deleteConfirm: 'Do you want to delete it?',
      confirmBPMDetected:
        'The BPM of the audio file is {bpm} BPM. Do you want to use it?\n\n※ BPM auto-detectio only works with 90-180 BPM range, and it may not be accurate. Also, varied tempo is not considered, so please take it only as a reference.',
      nothingToUndo: 'Nothing to undo',
      nothingToRedo: 'Nothing to redo',
      projectDeleted: 'Project {name} is deleted',
      noProjectOpened: 'No project is opened',
      confirm: 'Are you really sure?',
      database: {
        confirmImport:
          'Do you really want to import the database file? All current data will be lost.',
        importSuccess: 'Successfully imported',
        importFailed: 'Import failed',
        exportSuccess: 'Successfully exported',
        exportFailed: 'Export failed',
      },
      library: {
        loadingFailed: 'Failed to load library.',
        uploadTooLongConfirm:
          'The notes you are uploading are more than 20. Do you really want to upload them?\n\n⚠ DO NOT upload the full scores here. This is not for uploading scores！ ⚠\nIf you want to upload a score, please refer to “Help”.',
        uploadNotSelectedError: 'Please select some notes to upload.',
        uploadSuccess: 'The notes are successfully uploaded.',
        uploadFailed: 'Upload failed.',
      },
      project: {
        importSuccess: '{name} imported.',
        importFailed: 'Import failed',
      },
      noteError: {
        stacked:
          'Note stacking with the same tick, consider select them then and use "Shrink"',
        warning: 'Note are in incorrect position, consider adjust them',
        corrupted:
          'Note is corrupted by non-integer tick, consider select them and use "Fix tick"',
      },
    },
    mutation: {
      update: 'updated',
      append: 'appended',
      set: 'set',
      cut: 'cut',
      delete: 'deleted',
      flip: 'flipped',
      move: 'moved',
      resize: 'resized',
      paste: 'pasted',
      divide: 'divided',
      combine: 'combined',
      message: '{amount} {type} {operation}',
      convert: 'converted',
      target: {
        note: 'notes',
        slide: 'slides',
        slidenote: 'slide notes',
        timeSignature: 'time signatures',
        bpm: 'BPMs',
      },
    },
    snapTo: {
      snap: '{n}-Division',
      custom: 'Custom Division',
      snapWithRange: 'Divisions (1 ~ 1920)',
    },
    dialog: {
      bpmTitle: 'Set BPM',
      timeSignatureTitle: 'Set Time Signature',
      customSnappingTitle: 'Set Custom Division',
      imageTitle: 'Export Image',
      libraryTitle: 'Library',
      preferencesTitle: 'Preferences',
      projectsTitle: 'Projects',
      append: 'Append',
      change: 'Change',
      export: 'Export',
      delete: 'Delete',
      ok: 'OK',
      new: 'New',
      openscore: 'Open Score File',
      about: 'About PaletteWorks Editor',
    },
    preferences: {
      autosaveInterval: 'Auto-save Interval (sec)',
      scrollSpeed: 'Scroll Speed (x)',
      laneWidth: 'Lane Width',
      noteHeight: 'Note Height',
      minimapEnabled: 'Enable Minimap (Score Outline)',
      multiTapWarningEnabled: 'Enable multiple-tap (3 or above) warning',
      fileSaveName: 'File Save Name',
      fileSaveNameTooltip: 'Currently supported keywords:',
      autoDetectBPM: 'Auto-detect BPM',
    },
    modes: {
      select: 'Select',
      tap: 'Tap',
      slide: 'Slide',
      mid: 'Step',
      flick: 'Flick',
      critical: 'Critical',
      bpm: 'BPM',
      timeSignature: 'Time Signature',
    },
  },
}

export default en

// if(typeof MultiFileUpload !== 'undefined') {
  new MultiFileUpload({
    container: document.querySelector('.dps-multi-file-upload'),
    uploadUrl: '/prisoner/spike',
    deleteUrl: '/prisoner/spike'
  });
// }
var DpsFrontend = {}

DpsFrontend.dragAndDropSupported = function() {
  var div = document.createElement('div');
  return typeof div.ondrop != 'undefined';
};

DpsFrontend.formDataSupported = function() {
  return typeof FormData == 'function';
};

DpsFrontend.fileApiSupported = function() {
  var input = document.createElement('input');
  input.type = 'file';
  return typeof input.files != 'undefined';
};

if (
  DpsFrontend.dragAndDropSupported() &&
  DpsFrontend.formDataSupported() &&
  DpsFrontend.fileApiSupported()
) {
  DpsFrontend.MultiImageUpload = function (params) {
    this.defaultParams = {
      uploadFileEntryHook: $.noop,
      uploadFileExitHook: $.noop,
      uploadFileErrorHook: $.noop,
      fileDeleteHook: $.noop,
      uploadStatusText: 'Uploading files, please wait',
      dropzoneHintText: 'Drag and drop files here or',
      dropzoneButtonText: 'Choose files'
    }

    this.params = $.extend({}, this.defaultParams, params)
    this.container = $(this.params.container)

    this.container.addClass('dps-multi-image-upload--enhanced')

    this.feedbackContainer = this.container.find(
      '.dps-multi-image__uploaded-files'
    )
    this.setupFileInput()
    this.setupDropzone()
    this.setupLabel()
    this.setupStatusBox()
    this.container.on(
      'click',
      '.dps-multi-image-upload__delete',
      $.proxy(this, 'onFileDeleteClick')
    )
  }

  DpsFrontend.MultiImageUpload.prototype.setupDropzone = function () {
    this.fileInput.wrap('<div class="dps-multi-image-upload__dropzone" />')
    this.dropzone = this.container.find('.dps-multi-image-upload__dropzone')
    this.dropzone.on('dragover', $.proxy(this, 'onDragOver'))
    this.dropzone.on('dragleave', $.proxy(this, 'onDragLeave'))
    this.dropzone.on('drop', $.proxy(this, 'onDrop'))
  }

  DpsFrontend.MultiImageUpload.prototype.setupLabel = function () {
    this.label = $(
      `<label for="${this.fileInput[0].id}" class="govuk-button govuk-button--secondary">${this.params.dropzoneButtonText}</label>`
    )
    this.dropzone.append(
      `<p class="govuk-body">${this.params.dropzoneHintText}</p>`
    )
    this.dropzone.append(this.label)
  }

  DpsFrontend.MultiImageUpload.prototype.setupFileInput = function () {
    this.fileInput = this.container.find('.dps-multi-image-upload__input')
    this.fileInput.on('change', $.proxy(this, 'onFileChange'))
    this.fileInput.on('focus', $.proxy(this, 'onFileFocus'))
    this.fileInput.on('blur', $.proxy(this, 'onFileBlur'))
  }

  DpsFrontend.MultiImageUpload.prototype.setupStatusBox = function () {
    this.status = $(
      '<div aria-live="polite" role="status" class="govuk-visually-hidden" />'
    )
    this.dropzone.append(this.status)
  }

  DpsFrontend.MultiImageUpload.prototype.onDragOver = function (e) {
    e.preventDefault()
    this.dropzone.addClass('dps-multi-image-upload--dragover')
  }

  DpsFrontend.MultiImageUpload.prototype.onDragLeave = function () {
    this.dropzone.removeClass('dps-multi-image-upload--dragover')
  }

  DpsFrontend.MultiImageUpload.prototype.onDrop = function (e) {
    e.preventDefault()
    this.dropzone.removeClass('dps-multi-image-upload--dragover')
    this.feedbackContainer.removeClass('dps-hidden')
    this.status.html(this.params.uploadStatusText)
    this.uploadFiles(e.originalEvent.dataTransfer.files)
  }

  DpsFrontend.MultiImageUpload.prototype.uploadFiles = function (files) {
    for (let i = 0; i < files.length; i++) {
      this.uploadFile(files[i])
    }
  }

  DpsFrontend.MultiImageUpload.prototype.onFileChange = function (e) {
    this.feedbackContainer.removeClass('dps-hidden')
    this.status.html(this.params.uploadStatusText)
    this.uploadFiles(e.currentTarget.files)
    this.fileInput.replaceWith($(e.currentTarget).val('').clone(true))
    this.setupFileInput()
    this.fileInput.get(0).focus()
  }

  DpsFrontend.MultiImageUpload.prototype.onFileFocus = function (e) {
    this.label.addClass('dps-multi-image-upload--focused')
  }

  DpsFrontend.MultiImageUpload.prototype.onFileBlur = function (e) {
    this.label.removeClass('dps-multi-image-upload--focused')
  }

  DpsFrontend.MultiImageUpload.prototype.getSuccessHtml = function (success) {
    return `<span class="dps-multi-image-upload__success"> <svg class="moj-banner__icon" fill="currentColor" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" height="25" width="25"><path d="M25,6.2L8.7,23.2L0,14.1l4-4.2l4.7,4.9L21,2L25,6.2z"/></svg>${success.messageHtml}</span>`
  }

  DpsFrontend.MultiImageUpload.prototype.getErrorHtml = function (error) {
    return `<span class="dps-multi-image-upload__error"> <svg class="moj-banner__icon" fill="currentColor" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" height="25" width="25"><path d="M13.6,15.4h-2.3v-4.5h2.3V15.4z M13.6,19.8h-2.3v-2.2h2.3V19.8z M0,23.2h25L12.5,2L0,23.2z"/></svg>${error.message}</span>`
  }

  DpsFrontend.MultiImageUpload.prototype.getFileRowHtml = function (file) {
    const html = `
    <div class="govuk-summary-list__row dps-multi-image-upload__row">;
      <div class="govuk-summary-list__value dps-multi-image-upload__message">;
    <span class="dps-multi-image-upload__filename">${file.name}</span>;
    <span class="dps-multi-image-upload__progress">0%</span>;
      </div>';
      <div class="govuk-summary-list__actions dps-multi-image-upload__actions"></div>;
    </div>`
    return html
  }

  DpsFrontend.MultiImageUpload.prototype.getDeleteButtonHtml = function (file) {
    return `<button class="dps-multi-image-upload__delete govuk-button govuk-button--secondary govuk-!-margin-bottom-0" type="button" name="delete" value="${file.filename}">
      Delete <span class="govuk-visually-hidden">${file.originalname}</span>
    </button>`
  }

  DpsFrontend.MultiImageUpload.prototype.uploadFile = function (file) {
    this.params.uploadFileEntryHook(this, file)
    const item = $(this.getFileRowHtml(file))
    const formData = new FormData()
    formData.append('documents', file)
    this.feedbackContainer.find('.dps-multi-image-upload__list').append(item)

    $.ajax({
      url: this.params.uploadUrl,
      type: 'post',
      data: formData,
      processData: false,
      contentType: false,
      success: $.proxy(function (response) {
        if (response.error) {
          item
            .find('.dps-multi-image-upload__message')
            .html(this.getErrorHtml(response.error))
          this.status.html(response.error.message)
        } else {
          item
            .find('.dps-multi-image-upload__message')
            .html(this.getSuccessHtml(response.success))
          this.status.html(response.success.messageText)
        }
        item
          .find('.dps-multi-image-upload__actions')
          .append(this.getDeleteButtonHtml(response.file))
        this.params.uploadFileExitHook(this, file, response)
      }, this),
      error: $.proxy(function (jqXHR, textStatus, errorThrown) {
        this.params.uploadFileErrorHook(
          this,
          file,
          jqXHR,
          textStatus,
          errorThrown
        )
      }, this),
      xhr: function () {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener(
          'progress',
          function (e) {
            if (e.lengthComputable) {
              let percentComplete = e.loaded / e.total
              percentComplete = parseInt(percentComplete * 100, 10)
              item
                .find('.dps-multi-image-upload__progress')
                .text(` ${percentComplete}%`)
            }
          },
          false
        )
        return xhr
      }
    })
  }

  DpsFrontend.MultiImageUpload.prototype.onFileDeleteClick = function (e) {
    e.preventDefault() // if user refreshes page and then deletes
    const button = $(e.currentTarget)
    const data = {}
    data[button[0].name] = button[0].value
    $.ajax({
      url: this.params.deleteUrl,
      type: 'post',
      dataType: 'json',
      data: data,
      success: $.proxy(function (response) {
        if (response.error) {
          // handle error
        } else {
          button.parents('.dps-multi-image-upload__row').remove()
          if (
            this.feedbackContainer.find('.dps-multi-image-upload__row')
              .length === 0
          ) {
            this.feedbackContainer.addClass('dps-hidden')
          }
        }
        this.params.fileDeleteHook(this, response)
      }, this)
    })
  }
}

if(typeof DPSFrontend.MultiImageUpload !== 'undefined') {
  new DPSFrontend.MultiImageUpload({
    container: document.querySelector('.dps-multi-image-upload'),
    uploadUrl: '/ajax-upload-url',
    deleteUrl: '/ajax-delete-url'
  });
}
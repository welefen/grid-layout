export default class Sync {
  constructor({
    warn = true,
    needError = false,
    tipFn
  } = {}) {
    this.protocol = location.protocol
    this.host = location.host
    this.prefix = this.protocol + '//' + this.host
    this.warn = warn
    this.needError = needError
    this.tipFn = tipFn
  }

  /**
   * GET 方法
   * @param {String} path   [请求地址]
   * @param {Object} param  [附带参数]
   * @param {Object} option [ajax选项]
   */
  GET(path, param = {}, option = {}) {
    const options = Object.assign({
      url: this.prefix + path,
      type: 'GET',
      data: param,
      timeout: 20000,
      _t: Date.now()
    }, option)
    return $.ajax(options).then(this.done, this.fail)
  }

  /**
   * [POST 方法]
   * @param {String} path   [请求地址]
   * @param {Object} param  [附带参数]
   * @param {Object} option [ajax选项]
   */
  POST(path, param = {}, option = {}, method) {
    // param.token = SD.token;
    const options = Object.assign({
      url: this.prefix + path,
      type: method || 'POST',
      data: param,
      timeout: 20000
    }, option)
    return $.ajax(options).then((...args) => this.done(...args), (...args) => this.fail(...args))
  }

  PUT(path, param, option) {
    return this.POST(path, param, option, 'PUT');
  }

  /**
   * [DELETE 方法]
   * @param {String} path   [请求地址]
   * @param {Object} option [ajax选项]
   */
  DELETE(path, option = {}) {
    const options = Object.assign({
      url: this.prefix + path,
      type: 'DELETE',
      // data: {token: SD.token},
      contentType: false
    }, option)
    return $.ajax(options).then((...args) => this.done(...args), (...args) => this.fail(...args))
  }

  /**
   * [POST 方法]
   * @param {String} path   [请求地址]
   * @param {Object} param  [附带参数]
   * @param {Object} option [ajax选项]
   */
  FORMDATA(path, formdata, option = {}) {
    // formdata.append('token', SD.token);
    const options = Object.assign({
      url: this.prefix + path,
      type: 'POST',
      contentType: false,
      data: formdata,
      processData: false
    }, option)
    return $.ajax(options).then((...args) => this.done(...args), (...args) => this.fail(...args))
  }

  // 成功后的默认回调，会将所有data返回
  // 并且在失败的时候弹出失败信息
  done(data, status, xhr) {
    return new Promise((resolve, reject) => {
      if (data.errno !== 0) {
        if (this.warn) {
          console.warn(data)
          if (data.errmsg) {
            this.tipFn && this.tipFn(data.errmsg)
          }
        }
        return reject(data)
      }
      return resolve(data.data)
    })
  }

  // 失败的时候的默认回调
  fail(xhr, errorType, error) {
    return new Promise((resolve, reject) => {
      console.error(errorType, error);
      this.tipFn && this.tipFn(error || '网络故障～～');
      throw new Error(error || '网络故障~~');
    });
  }
}

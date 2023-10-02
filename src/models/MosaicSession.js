import $ from 'jquery';

export default class MosaicSession {
  constructor(client_application_id) {
    this.client_application_id = client_application_id;
    this.url = null;
    this.apiVersion =  '/api/v1';

    this.user = null;

    this.experiment_id = null;
    this.project = null;
    this.geneSet = null;

    this.fileTypes = "diffExp"; //NOTE: will be whatever it is in mosaic in terms of file name; api indicates this should be a list of strings but there is only one type we would like to get

    this.theFile = null;
    this.theFileType = null;
    this.tokenType = null;

    this.authorizationString = null;
  }

  promiseInit(source, projectId, tokenType, geneSetId=null, fileID=null) {
    let self = this;
    self.tokenType = tokenType;
    self.api = source + self.apiVersion;
    self.project_id = projectId;

    self.authorizationString = tokenType + " " + localStorage.getItem('mosaic-iobio-tkn');
    
    return new Promise((resolve, reject) => {

      //USER
      self.promiseGetCurrentUser()
      .then(function(data) {
        self.user = data; // get the user and store that here as part of our session object
      })
      .catch(function(error) {
        console.log(error)
        reject(error)
      })

      //PROJECT
      self.promiseGetProject(projectId)
      .then(function(data) {
        self.project = data;
        return self.promiseGetFilesForProject(projectId, fileID);
      })
      .catch(function(error) {
        console.log(error)
        reject(error)
      })

    })
  }

  promiseGetCurrentUser() {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getCurrentUser()
        .done(response => {
          resolve(response)
        })
        .fail(error => {
          let errorMsg = error.responseText ? error.responseText : "";
          let msg = "Error getting current Mosaic user.  Your authorization may have expired.  Make sure you are still logged into Mosaic, and relaunch the project."
          reject(msg);
        })
    })
  }

  getCurrentUser() {
    let self = this;

    return $.ajax({
      url: self.api + '/user',
      type: 'GET',

      headers: {
        Authorization: self.authorizationString,
        accept: 'application/json',
      },
    });
  } 

  promiseGetProject(project_id) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getProject(project_id)
      .done(data => {
          resolve(data);
      })
      .fail(error => {
        let errorMsg = self.getErrorMessage(error);
        reject("Error getting project " + project_id + ": " + errorMsg);
      });
    });
  }

  getProject(projectId) {
    let self = this;
    return $.ajax({
        url: self.api + '/projects/' + projectId,
        type: 'GET',
        headers: {
            Authorization: self.authorizationString,
            accept: 'application/json',
        }
    });
  }

  promiseGetFilesForProject(project_id) {
      let self = this;
      return new Promise((resolve,reject) => {
          self.getFilesForProject(project_id)
              .done(response => {
                  resolve(response);
              })
              .fail(error => {
                let errorMsg = self.getErrorMessage(error);
                console.log("Unable to get files for project " + project_id + " error: " + errorMsg);
                reject(errorMsg);
              })
      })
  }

  getFilesForProject(project_id) {
      let self = this;
      return $.ajax({
          url: self.api +  '/projects/' + project_id + '/files',
          type: 'GET',
          headers: {
              Authorization: self.authorizationString,
              accept: 'application/json',
          }
      });
  }

  promiseGetFileForDiffExp(project_id) {
    let self = this;
    return new Promise((resolve,reject) => {
      self.getFileForDiffExp(project_id)
      .done(response => {
        resolve(response);
      })
      .fail(error => {
        let errorMsg = self.getErrorMessage(error);
        console.log("Unable to get files for project " + project_id + " error: " + errorMsg);
        reject(errorMsg);
      })
    })
  }
  //Not used yet until we have a file type to grab
  getFileForDiffExp(project_id) {
    let self = this;
    return $.ajax({
      url: self.api +  '/projects/' + project_id + '/files' + '?file_types=' + self.fileTypes,
      type: 'GET',
      accept: 'application/json',
      headers: {
        Authorization: self.authorizationString,
      }
    });
  }

  promiseGetSignedUrlForFile(project_id, fileId) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.getSignedUrlForFile(project_id, fileId)
      .done(file => {
        resolve(file);
      })
      .fail(error => {
        let errorMsg = self.getErrorMessage(error);
        let msg = "Could not get signed url for file_id  " + fileId+ " error: " + errorMsg;
        console.log(msg)
        reject(msg);
      })
    })
  }

  getSignedUrlForFile (project_id, fileId) {
    let self = this;
    return $.ajax({
      url: self.api +  '/projects/' + project_id + '/files/' + fileId + '/url',
      type: 'GET',
      headers: {
        Authorization: self.authorizationString,
        accept: 'application/json',
      }
    });
  }

  promiseGetFileFromSignedUrl(signedUrl) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.getFileFromSignedUrl(signedUrl)
      .done(file => {
        resolve(file);
      })
      .fail(error => {
        let errorMsg = self.getErrorMessage(error);
        let msg = "Could not get file from signed url " + signedUrl + " error: " + errorMsg;
        console.log(msg)
        reject(msg);
      })
    })
  }
  
  getFileFromSignedUrl(signedUrl) {
    let self = this;
    let proxyURL = 'https://cddrc.utah.edu/api/i/client-applications/igv/proxy/'; //proxy url
    let builtURL = self.api + '/files/serve?file_url=' + encodeURIComponent(signedUrl); //the serve endpoint
    return $.ajax({
      url: builtURL, 
      type: 'GET',
      headers: {
        Authorization: self.authorizationString,
        accept: 'application/json',
      }
    });
  }

  //-------------------------------------Get Gene Set: related if we want to load a set of genes from mosaic to look for/preselect in the gene list
  promiseGetGeneSet(projectId, geneSetId) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getGeneSet(projectId, geneSetId)
      .done(response => {
        resolve(response)
      })
      .fail(error => {
        let errorMsg = self.getErrorMessage(error);
        console.log("Error getting gene set from Mosaic with gene_set_id " + geneSetId);
        console.log(errorMsg)
        reject("Error getting gene set " + geneSetId + ": " + errorMsg);
      })
    })

  }

  async getGeneSet(projectId, geneSetId) {
    let self = this;

    return $.ajax({
      url: self.api + '/projects/' + projectId + '/genes/sets/' + geneSetId,
      type: 'GET',
      headers: {
        Authorization: self.authorizationString,
        accept: 'application/json',
      },
    });
  }

  getErrorMessage(error) {
    if (error.hasOwnProperty('responseJSON') && error.responseJSON.hasOwnProperty('message')) {
      return error.responseJSON.message;
    } else if (error.hasOwnProperty('responseText')) {
      return error.responseText;
    } else {
      return error.toString()
    }
  }

}

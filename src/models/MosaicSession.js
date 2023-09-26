/**
 * Gene App hooks in with this
 *  if (localStorage.getItem('hub-iobio-tkn') && localStorage.getItem('hub-iobio-tkn').length > 0 && self.sampleId && self.paramSource) {
      self.launchedFromHub = true;

      So basically it looks in local storage and if it finds a token, it assumes it was launched from mosaic we dont need sample id but will need projectId
 */
export default class MosaicSession {
  constructor(clientApplicationId) {
    this.url = null;
    this.apiVersion =  '/api/v1';
    this.client_application_id = clientApplicationId,
    this.user = null;
    this.fileTypes = "diffExp"; //NOTE: will be whatever it is in mosaic in terms of file name; api indicates this should be a list of strings but there is only one type we would like to get
    this.experiment_id = null;
  }

  promiseInit(source, projectId, experimentId, geneSetId) {
    let self = this;
    self.api = source + self.apiVersion;
    self.experiment_id = experimentId;

    return new Promise((resolve, reject) => {
      let geneSet = null;

      self.promiseGetCurrentUser()
      .then(function(data) {
        self.user = data; // get the user and store that here as part of our session object
      })
      .catch(function(error) {
        console.log(error)
        reject(error)
      })

      self.promiseGetProject(projectId)
      .then(function(data) {
        self.project = data;
        return self.promiseGetFilesForProject(projectId)
      })


      self.promiseGetClientApplication()
      .then(function() {
        if (geneSetId) {
          return self.promiseGetGeneSet(projectId, geneSetId)
        } else {
          return Promise.resolve(null);
        }
      })
      .then(function(data) {
        geneSet = data;

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
      contentType: 'application/json',
      headers: {
        Authorization: localStorage.getItem('hub-iobio-tkn'),
      },
    });
  } 

  promiseGetClientApplication() {
    let self = this;

    return new Promise(function(resolve, reject) {
      if(self.client_application_id){
      resolve();
    }
      else{
        reject("Cannot find Mosaic client_application for gene");
      }})
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
        contentType: 'application/json',
        headers: {
            'Authorization': localStorage.getItem('hub-iobio-tkn')
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
          url: self.api +  '/projects/' + project_id + '/files' + '?file_types=' + self.fileTypes,
          type: 'GET',
          contentType: 'application/json',
          headers: {
              'Authorization': localStorage.getItem('hub-iobio-tkn')
          }
      });
  }

  promiseGetSignedUrlForFile(project_id, sample_id, file) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.getSignedUrlForFile(project_id, sample_id, file)
      .done(file => {
        resolve(file);
      })
      .fail(error => {
        let errorMsg = self.getErrorMessage(error);
        let msg = "Could not get signed url for file_id  " + file.id + " error: " + errorMsg;
        console.log(msg)
        reject(msg);
      })
    })
  }

  getSignedUrlForFile (project_id, sample_id, file) {
    let self = this;
    return $.ajax({
      url: self.api +  '/projects/' + project_id + '/files/' + file.id + '/url',
      type: 'GET',
      contentType: 'application/json',
      headers: {
        'Authorization': localStorage.getItem('hub-iobio-tkn')
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

  getGeneSet(projectId, geneSetId) {
    let self = this;

    return $.ajax({
      url: self.api + '/projects/' + projectId + '/genes/sets/' + geneSetId,
      type: 'GET',
      contentType: 'application/json',
      headers: {
        Authorization: localStorage.getItem('hub-iobio-tkn'),
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

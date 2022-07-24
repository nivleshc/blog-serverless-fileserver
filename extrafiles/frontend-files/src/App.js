// use instructions from https://ui.docs.amplify.aws/react/connected-components/authenticator

import { Amplify } from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react'
import { Authenticator } from '@aws-amplify/ui-react';

import '@aws-amplify/ui-react/styles.css';

import awsExports from './aws-exports';

import './App.css';

import React from 'react';
import { Auth, API } from 'aws-amplify';

// define constants
const apiName = 'ServerlessFileserverAPI';
const apiEndpoint = 'https://serverlessfileserver.execute-api.ap-southeast-2.amazonaws.com/Prod'
const verbose = false

Amplify.configure(awsExports);
Amplify.configure({
  API: {
    endpoints: [
      {
        name: 'ServerlessFileserverAPI',
        endpoint: apiEndpoint
      }
    ]
  }
})

class App extends React.Component {
  constructor(props){
    super(props);
    this.getToken = this.getToken.bind(this);
    this.getFileList = this.getFileList.bind(this);
    this.downloadFile = this.downloadFile.bind(this);
    this.createFolder = this.createFolder.bind(this);
    this.onClickDownloadFile = this.onClickDownloadFile.bind(this);
    this.onClickFolderName = this.onClickFolderName.bind(this);
    this.onClickUploadButton = this.onClickUploadButton.bind(this);
    this.trim_string = this.trim_string.bind(this);  
    this.getMimeType= this.getMimeType.bind(this);
    this.fileInput = React.createRef();
    this.folderToCreate = React.createRef();
  }

  state = {
    isLoading: true,
    isAuthenticated : false,
    user : null,
    token : null,
    error: null,
    error_message: '',
    folderName: '/',
    fileList: null,
    hidefolderToCreateBox: true,
  }

  componentDidMount() {
    console.log('>componentDidMount:getToken')
    this.getToken();
  }

  getToken() {
    const currentSession = Auth.currentSession()
      .then(currentSessionDetails => {
        let userToken = currentSessionDetails.getIdToken().getJwtToken();
        this.setState(
          {
            token: userToken,
            isAuthenticated : true,
            error: false
          },
          () => {
            if (verbose) { console.log('>getToken:userToken:' + userToken); }
            this.getFileList()        // refresh the file listing whenever a new token is obtained
          }
        );
      })
      .catch(error => {
        this.setState({
          error: error,
          error_message : 'getToken:' + error.message,
          isAuthenticated : false,
        })
        console.log('>getToken:error:' + this.error_message)
        return;
      })


  }

  async getFileList() {
    if (this.state.isAuthenticated) {
      await this.state.token;
      const path = '/list';
      let myInit = null
      if ((this.state.folderName !== null) && (this.state.folderName !== '/')) {
        myInit = {
                headers: {
                  'Authorization': `Bearer ${this.state.token}`
                }, 
                response: true,
                queryStringParameters: {
                  'folderName': this.state.folderName
                }
              }
      }else{
        myInit = {
          headers: {
            'Authorization': `Bearer ${this.state.token}`
          },
          response: true,
        }
      }
      
      if (verbose) { console.log(`before getFileListing API.Get token=${this.state.token}`) }

      API.get(apiName, path, myInit)
        .then(response => {
          this.setState(
            {
              isLoading: false,
              fileList: response.data.fileList,
              folderName: response.data.dirPath,
              error: false
            },
            () => {
              if (verbose) { console.log('>getFileListing:APISuccess.Folder=' + this.state.folderName + ' FileList:' + this.state.fileList) }
            }
          );
        })
        .catch(error => {
          this.setState({
            isLoading: false,
            error : error,
            error_message : 'getFileList:' + error.message 
          })
          console.log('>getFileList:APIError:Error=' + this.error_message)
        })
    }else {
      console.log('>getFileList:notauthenticated:token=' + this.state.token)
    }
    return;
  }

  // this function removes multiple spaces in-between characters from a string
  trim_string(str){
    let tempstr = '';
    // check to ensure this is not an empty string. If it is then just return what you received
    if (str.length > 0){
      tempstr = str[0];
      for (let i=1; i< str.length; i++){
        if ((str[i] === ' ') && (str[i-1] === ' ')){
          // ignore this character as its a space after a space
        }else{
          tempstr += str[i];
        }
      }
      
    }else{
      tempstr = str; // if this is an empty string, then just return it as is
    }
    return tempstr;
  }

  // this function returns the mime type of the filename based on its file extension
  getMimeType(fileName){
    const default_mimetype = 'text/plain';

    console.log('>getMimeType:FileName=' + fileName)
    const fileName_split = fileName.split('.');
    if (fileName_split.length < 2){
      // this file doesn't have an extension. return default mimetype
      if (verbose) { console.log('>getMimeType:FileName=' + fileName + ' doesnt have extension. Returning default mimetype=' + default_mimetype) }
      return default_mimetype
    }else{
      const file_extension = fileName_split[fileName_split.length-1]
      let detected_mimetype = ''
      switch(file_extension){
        // list all application mimetypes
        case 'pdf':
          detected_mimetype = 'application/pdf';
          if (verbose) { console.log('getMimeType:FileName=' + fileName + ' fileExtension=' + file_extension + ' matched:pdf' + 'detected_mimetype:' + detected_mimetype); }
          return detected_mimetype;
        // list all text mimetypes
        case 'txt':
          detected_mimetype = 'text/plain';
          if (verbose) { console.log('getMimeType:FileName=' + fileName + ' fileExtension=' + file_extension + ' matched:txt' + 'detected_mimetype:' + detected_mimetype); }
          return detected_mimetype;
        // list all image mimetypes
        case 'png':
          detected_mimetype = 'image/png';
          if (verbose) { console.log('getMimeType:FileName=' + fileName + ' fileExtension=' + file_extension + ' matched:png' + 'detected_mimetype:' + detected_mimetype); }
          return detected_mimetype;
        case 'jpg':
          detected_mimetype = 'image/jpg'
          if (verbose) { console.log('getMimeType:FileName=' + fileName + ' fileExtension=' + file_extension + ' matched:jpg' + 'detected_mimetype:' + detected_mimetype); }
          return detected_mimetype;
        case 'jpeg':
          detected_mimetype = 'image/jpg'
          if (verbose) { console.log('getMimeType:FileName=' + fileName + ' fileExtension=' + file_extension + ' matched:jpeg' + 'detected_mimetype:' + detected_mimetype); }
          return detected_mimetype;
        default:
          detected_mimetype = default_mimetype;
          if (verbose) { console.log('getMimeType:FileName=' + fileName + ' fileExtension=' + file_extension + ' matched:default' + 'detected_mimetype:' + detected_mimetype); }
          return detected_mimetype;
      }
    }
  }

  async downloadFile(filePath) {
    const url = apiEndpoint + '/download?filePath=' + filePath; // add filePath as a queryString Parameter

    // extract filename from filePath
    const filePath_split = filePath.split('/');
    const fileName = filePath_split[filePath_split.length - 1];

    // get the mimetype of the file
    const mimeType = this.getMimeType(fileName);
    if (verbose) { 
      console.log('>downloadFile:filePath=' + filePath) 
      console.log('downloadFile:FileName:' + fileName + ':mimeType:' + mimeType);
    }
    
    // get the the file from Serverless FileServer
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': mimeType,
        'Authorization': `Bearer ${this.state.token}`
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });

    let blob = await response.blob();

    var newBlob = new Blob([blob], { type: mimeType });
    const data = window.URL.createObjectURL(newBlob);
    var link = document.createElement('a');
    link.href = data;
    link.download = fileName;
    link.click();
    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(data);
    }, 100);
  }

  // handle event when user clicks on a file to download it
  onClickDownloadFile(filePath) {
    this.downloadFile(filePath);
  }

  // handle event when user clicks on a folder name
  onClickFolderName(folderName){
    this.setState({
      isLoading: true,
      folderName: folderName
    })
    this.getFileList();
  }

  //show a message
  showMessage(msg){
    alert(msg)
  }

  // handle event when user clicks on CreateFolder button
  onClickCreateFolderButton(event){
    var currentFolder = this.state.folderName
    var folderToCreate = this.state.folderToCreate

    // unhide the input box so that the user can provide the name for the new folder to create
    this.setState({hidefolderToCreateBox: false })
  }

  // this function will create fhe folder in the backend
  async createFolder(event){
    var nameOfFolderToCreate = this.folderToCreate.current.value

    if (nameOfFolderToCreate.length == 0) {
      this.showMessage('Error! No new folder name specified. Please enter a name in the Folder Name textbox and press Continue or Cancel to abort')
    }else {
      const folderPath = this.state.folderName + nameOfFolderToCreate

      const url = apiEndpoint + '/createFolder' + '?folderPath=' + folderPath;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.state.token}`
        },
      })
      .then(response => {

        if (verbose) {
          console.log("createFolder:.then:response:" + response);
        }
        const status = response.status;
        if (status === 200){
          alert('Status:200. Folder ' + nameOfFolderToCreate + ' created successfully')
          this.getFileList() // refresh the file listing
        }else{
          alert('Status:'+status+' Error creating ' + nameOfFolderToCreate + ' Error:' + response.body)
        }
      })
      .catch(error => {
        console.log("createFolder:.catch:error:" + error);
        alert('Error uploading file:'+JSON.stringify(error));
      });

      this.setState({hidefolderToCreateBox: true })
    }
  }

  // handle event when user clicks on Upload button
  async onClickUploadButton(event){

    //find if user has selected any files
    const numFilesSelected = this.fileInput.current.files.length
    
    if (numFilesSelected === 0){
      // user has not selected any files, show alert
      alert('Error! No file chosen for uploading. Please choose a file and then click Upload');
    }else{
      // user has selected file. Upload it to backend
      const fileName = this.fileInput.current.files[0].name
      const filePath = this.state.folderName + fileName
      const fileMimeType = this.getMimeType(fileName);

      const url = apiEndpoint + '/upload' + '?filePath=' + filePath; // add filePath as a queryString Parameter

      let data = new FormData();
      data.append('file',this.fileInput.current.files[0]);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': fileMimeType,
          'Content-Type': fileMimeType,
          'Authorization': `Bearer ${this.state.token}`
        },
        body: this.fileInput.current.files[0]
      })
      .then(response => {

        if (verbose) {
          console.log("onClickUploadButton:.then:response");
          console.log(response)
        }
        const status = response.status;
        if (status === 200){
          alert('Status:200. File uploaded successfully')
          this.getFileList() // refresh the file listing
        }else{
          alert('Status:'+status+' Error uploading file. Please check server logs for more information')
        }
      })
      .catch(error => {
        console.log("onClickUploadButton:.catch:error");
        console.log(error)
        alert('Error uploading file:'+JSON.stringify(error));
      });
    }
  }

  render() {
    const { isLoading, isAuthenticated, error, error_message, folderName, fileList, folderToCreate } = this.state;
    let isrootFolder = (folderName === '/');
    var parentFolder = '';

    if (!isrootFolder){
      var folderName_split = folderName.split('/');

      if (folderName_split.length > 3){
        for (let i = 1; i < folderName_split.length - 2; i++) {
          parentFolder += '/' + folderName_split[i]
        }
        parentFolder += '/'
      }else{
        parentFolder = '/';
      }
      
      if (verbose) {
        console.log("folderName:"+folderName);
        console.log("folderName_split:"+folderName_split+" len:"+folderName_split.length);
        console.log("parentFolder:"+parentFolder);
      }
    }else{
      parentFolder = '/'
      if (verbose) { console.log(">render:FolderName:" + folderName + " isrootFolder:" + isrootFolder + " parentFolder:" + parentFolder) }
    }

    return (
      <Authenticator>
        {({ signOut, user }) => (
          <main>
            <h1><div align="center">Serverless FileServer</div></h1>
            <div><button class="signoutbtn" align="right" onClick={signOut}>SignOut</button><span class="email">{user.attributes.email}</span></div>
            
            {error ? <div class="error" align="center"><p>Error! {error_message}</p></div> : null}

            { !isAuthenticated 
              ? <h3>You are not logged in. Please re-login to the portal.</h3>
              : [
                  ( isLoading
                    ? <div key='1'><h3>Loading</h3></div>
                    : [
                        <div key='2'>Directory: {folderName} <br></br> </div>,
                        ( !isrootFolder
                          ? this.state.hidefolderToCreateBox
                            ? <span><button onClick={() => this.onClickFolderName(parentFolder)}> Back </button>
                              &nbsp;<span></span><button onClick={() => this.onClickCreateFolderButton()}> CreateFolder</button>
                              &nbsp;<span></span><button onClick={() => this.onClickUploadButton()}> Upload</button>
                              &nbsp;<input type="file" ref={this.fileInput} /> <br /><br /></span>
                            : <span><button onClick={() => this.onClickFolderName(parentFolder)}> Back </button>
                              &nbsp;<span></span><button onClick={() => this.onClickCreateFolderButton()}> CreateFolder</button>
                              &nbsp;<span></span><button onClick={() => this.onClickUploadButton()}> Upload</button>
                              &nbsp;<input type="file" ref={this.fileInput} /> <br /><br />
                              FolderName: <input type="text" ref={this.folderToCreate}/> 
                              <button onClick={() => this.createFolder()}> Continue </button>
                              <button onClick={() => this.setState({hidefolderToCreateBox: true})}> Cancel </button> <br /><br /></span> 
                          :   this.state.hidefolderToCreateBox
                              ? <span><button onClick={() => this.onClickCreateFolderButton()}> CreateFolder</button>
                                &nbsp;<span></span><button onClick={() => this.onClickUploadButton()}> Upload</button>
                                &nbsp;<input type="file" ref={this.fileInput}/> <br /><br /></span> 
                              : <span><button onClick={() => this.onClickCreateFolderButton()}> CreateFolder</button>
                                 &nbsp;<span></span><button onClick={() => this.onClickUploadButton()}> Upload</button>
                                 &nbsp;<input type="file" ref={this.fileInput}/> <br /><br />
                                 FolderName: <input type="text" ref={this.folderToCreate}/> 
                                 <button onClick={() => this.createFolder()}> Continue </button>
                                 <button onClick={() => this.setState({hidefolderToCreateBox: true})}> Cancel </button> <br /><br /></span> 
                        ),
                        
                        ( fileList !== null
                          ? ( fileList.map((row, index) => {
                              row = this.trim_string(row) // replace sequential spaces with just one space

                              if (row.length > 0 && row[0] === 'd' && row[row.length-1] === '/'){
                                // this is a folder. get the name of the folder
                                const row_split = row.split(' ')
                                let folderName = row_split[row_split.length-1]
                                let folderFullPath = this.state.folderName + folderName
                                let row_minus_folderName = row.substring(0,row.length-folderName.length)
                                
                                // create a clickable link for the folder
                                return <span key={index}>{row_minus_folderName}<a class="folder"><i class="fa fa-folder"></i></a><a href="#" onClick={() => this.onClickFolderName(folderFullPath)}>{folderName}</a><br /></span>
                              }else{
                                if (row[0] === '-'){
                                  // this is a file
                                  const row_split = row.split(' ')
                                  // from observation, filename is after 8th result of the split
                                  let fileName = row_split[8]
                                  if (verbose) { 
                                    console.log("row:"+row)
                                    console.log("row_split:"+row_split+" len:"+row_split.length)
                                  }
                                  
                                  if (row_split.length > 8){
                                    for (let i=9; i< row_split.length; i++){
                                      fileName += ' ' + row_split[i]
                                    }
                                  }
                                  
                                  if (verbose) { console.log('fileName:'+fileName) }
                                  const row_minus_fileName = row.substring(0,row.length-fileName.length)
                                  const filePath = this.state.folderName + fileName
        
                                  return <span key={index}>{row_minus_fileName}<a href="#" onClick={() => this.onClickDownloadFile(filePath)}>{fileName}</a><br /></span>
                                }
                                else {
                                  // this is not a file or folder
                                  return <span key={index}>{row}<br /> </span> 
                                }
                              }
                            })
                            )
                          : []
                        )
                      ]
                  )
                ]
            }

          </main>
        )}
      </Authenticator>
    );
  }
}

export default withAuthenticator(App);
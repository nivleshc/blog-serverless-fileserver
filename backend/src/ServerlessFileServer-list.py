import os
import json
import subprocess

def lambda_handler(event, context):
    
    # define variables and constants -- start
    rootDir = os.environ["EFS_MOUNT_PATH"]
    portal_url = os.environ["AMPLIFY_PORTAL_URL"]

    # define variables and constants -- end
    
    # check if the user has provided a subfolder name. If yes then append that to the rootDir. Otherwise defaul to rootDir
    try:
        folderName = event['queryStringParameters']['folderName']
        print("User provided folderName:" + folderName)

        #if the user provides / or tries to use . to go one level higher, force dirPath to rootDir
        if ((folderName == '/') or (folderName.startswith('.'))):
            print("Maybe illegal folderName provided ["+folderName + "] dirPath set to rootDir:"+rootDir)
            folderName = '/'
            dirPath = rootDir
        else:
            dirPath = rootDir + folderName
    except Exception as e:
        print("Error! "+ str(e)+" dirPath set to rootDir:"+rootDir)
        folderName = '/'
        dirPath = rootDir

    command = "ls -lFh " + dirPath

    proc = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)

    fileListResponse = proc.stdout.read().decode("utf-8").split('\n')
    print("FileList:Response "+str(fileListResponse))

    responseBody = {
       'fileList': fileListResponse,
       'dirPath' : folderName
    }

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': portal_url,
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'isBase64Encoded': 'false',
        'body': json.dumps(responseBody)
    }
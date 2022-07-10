import os
import base64

def get_mime_type(fileName):
    default_mimetype = 'text/plain'
    
    fileName_split = fileName.split('.')

    if len(fileName_split) < 2:
      # this file doesn't have an extension. return default mimetype
      return default_mimetype
    else:
      file_extension = fileName_split[len(fileName_split)-1]
      
      if (file_extension == 'pdf'):
        return 'application/pdf'
      elif (file_extension == 'txt'):
        return 'text/plain'
      elif (file_extension == 'png'):
        return 'image/png'
      elif (file_extension == 'jpg'):
        return  'image/jpg'
      elif (file_extension == 'jpeg'):
          return 'image/jpeg'
      else:
          return default_mimetype

def lambda_handler(event, context):
    
    # define variables and constants -- start

    rootDir = os.environ["EFS_MOUNT_PATH"]
    portal_url = os.environ["AMPLIFY_PORTAL_URL"]

    # define variables and constants -- end
    
    try:
        filePath = event['queryStringParameters']['filePath']
        fullFilePath = rootDir + filePath

        file_mime_type = get_mime_type(filePath)
        print("User provided filePath:" + filePath + " fullFilePath:"+fullFilePath + ' mimetypedetected:' + file_mime_type)
        
        # read the file
        requestedFile = open(fullFilePath,"rb")
        requestedFileContents = requestedFile.read()
        requestedFile.close()
        
        statusCode = 200

    except Exception as e:
        statusCode = 400
        error = 'Error! ' + str(e)
        print(error)
    
    if (statusCode == 200):
        response = {
            'statusCode': statusCode,
            'headers': {
                'Content-Type': file_mime_type,
                'Access-Control-Allow-Origin': portal_url,
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': base64.b64encode(requestedFileContents).decode('utf-8'),
            'isBase64Encoded': True
        }
    else:
        response = {
            'statusCode': statusCode,
            'headers': {
                'Content-Type': 'application/text',
                'Access-Control-Allow-Origin': portal_url,
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': error,
            'isBase64Encoded': False
        }
    
    return response
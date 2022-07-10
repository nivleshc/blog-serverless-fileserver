import os
import json
import base64

def lambda_handler(event, context):

    rootDir = os.environ["EFS_MOUNT_PATH"]
    portal_url = os.environ["AMPLIFY_PORTAL_URL"]
    defaultFilePath = '/unnamed.pdf'
    
    # get the filepath to store the file at
    try:
        filePath = event['queryStringParameters']['filePath']
        print("User provided filePath:" + filePath)
        
        # if the user does not include a leading / in the path or has . as the start of the path, save the file at the rootDir 
        if (not filePath.startswith('/')):
            if (filePath.startswith('.')):
                filePath = '/' + filePath[1:]   #remove . and put /
            else:
                # user hasn't provided any folder, default it to rootDir
                filePath = '/' + filePath
    except Exception as e:
        # most probably there was no filePath specified. Store it using defaultFilePath
        filePath = defaultFilePath
        print("Error! "+ str(e) + " :default filepath will be used:" + filePath)

    filePath = rootDir + filePath
    
    print("actual filepath used:"+filePath)
    
    try:
        original_payload = event['body']
        isBase64Encoded = event['isBase64Encoded']
        
        if isBase64Encoded:
            final_payload = base64.b64decode(original_payload)
            print('filePath=' + filePath + ' is base64encoded='+ str(isBase64Encoded) + ' OriginalType=' + str(type(original_payload)) + ' FinalType=' + str(type(final_payload)) + ' content will be decoded before saving')
            
        else:
            final_payload = str.encode(original_payload)
            print('filePath=' + filePath + ' is NOT base64encoded='+ str(isBase64Encoded) + ' type=' + str(type(final_payload)) + ' content will written as is')
        
        f = open(filePath,'w+b')
        f.write(final_payload)
        result = "file written successfully"
        statusCode = 200
    except Exception as e:
        result = "Error!:"+str(e)
        statusCode = 400
    
    print("result of file save:["+filePath+"]:"+result)
    print("json:"+json.dumps(result))

    response = {
       'statusCode': statusCode,
        'headers': {
            'Content-Type': 'application/text',
            'Access-Control-Allow-Origin': portal_url,
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': result,
        'isBase64Encoded': False
    }
    
    return response
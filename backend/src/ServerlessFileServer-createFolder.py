import os

def lambda_handler(event, context):

    rootDir = os.environ["EFS_MOUNT_PATH"]
    portal_url = os.environ["AMPLIFY_PORTAL_URL"]
    error = False
    
    # get the path of the folder to create
    try:
        folderPath = event['queryStringParameters']['folderPath']
        originalFolderPath = folderPath
        print("User provided folderPath:" + folderPath)
        
        # if the user does not include a leading / in the path or has . as the start of the path, then create the folder in the root directory
        if (not folderPath.startswith('/')):
            if (folderPath.startswith('.')):
                folderPath = '/' + folderPath[1:]   #remove . and put /
            else:
                # user hasn't provided any folder, default it to rootDir
                folderPath = '/' + folderPath
    except Exception as e:
        # most probably there was no folderPath specified. Return an error
        result = "Error! Received folderPath=" + folderPath + " Exception:"+ str(e)
        error = True
        statusCode = 400
        print(result)

    if not error:
        folderPath = rootDir + folderPath
        
        print("absolute folderPath:"+folderPath)
        
        try:
            os.mkdir(folderPath)
            result = originalFolderPath + " created successfully"
            statusCode = 200
        except Exception as e:
            result = "Error creating " + originalFolderPath + " Exception:" + +str(e)
            statusCode = 400
    
    print(result)

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
import os
import shutil
import frontmatter
import json


sourceDir = 'content'
distDir = 'public_html/content'


def refreshDir(dir):
	if os.path.exists(dir):
		shutil.rmtree(dir)
	if not os.path.exists(dir):
		os.makedirs(dir)

def markdownToDict(markdownFilePath):
	markdownData = frontmatter.load(markdownFilePath)
	markdownDict = markdownData.to_dict()
	# convert markdown to html here already: http://pythonhosted.org//Markdown/siteindex.html
	return markdownDict

def dictToJson(markdownDict, jsonFilePath):
	#print jsonFilePath
	jsonFile = open(jsonFilePath, 'w')
	json.dump(markdownDict, jsonFile, indent=4)
	jsonFile.close()

def addSubpagePaths(markdownDict, sourceDir, subDir):
	markdownDict['subpages'] = []
	if os.path.isdir(os.path.join(sourceDir, subDir)):
		for subFileName in os.listdir(os.path.join(sourceDir, subDir)):
			if isFile(os.path.join(sourceDir, subDir), subFileName):
				subFilePath = os.path.join(subDir, os.path.splitext(subFileName)[0])
				subFilePath = os.path.join(*subFilePath.split("/")[0:])
				markdownDict['subpages'].append(subFilePath)

def isFile(sourceDir, fileName):
	return os.path.isfile(os.path.join(sourceDir, fileName)) and not fileName.startswith('.')

def isDir(sourceDir, fileName):
	return os.path.isdir(os.path.join(sourceDir, fileName))

def mdToJson(sourceDir, distDir, currentSubDir):

	sourceDirPath = os.path.join(sourceDir, currentSubDir)
	distDirPath = os.path.join(distDir, currentSubDir)

	for fileName in os.listdir(sourceDirPath):
		
		#print os.path.join(sourceDirPath, fileName)

		if isFile(sourceDirPath, fileName):

			markdownDict = markdownToDict(os.path.join(sourceDirPath, fileName))

			if not os.path.exists(distDirPath):
				os.makedirs(distDirPath)

			fileNameWithoutExt = os.path.splitext(fileName)[0]
			addSubpagePaths(markdownDict, sourceDir, os.path.join(currentSubDir, fileNameWithoutExt))

			dictToJson(markdownDict, os.path.join(distDirPath, fileNameWithoutExt+'.json'))

		if isDir(sourceDirPath, fileName):

			mdToJson(sourceDir, distDir, os.path.join(currentSubDir, fileName))


refreshDir(distDir)
mdToJson(sourceDir, distDir, "")




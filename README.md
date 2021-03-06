# GET READY!
================================================================
## python packetmanager: pip
	
```
$ sudo easy_install pip
```

### python-frontmatter

* Parse and manage markdown posts with YAML frontmatter.
* htps://pypi.python.org/pypi/python-frontmatter/0.1.1

```
$ pip install python-frontmatter
```

### watchdog

* http://pythonhosted.org//watchdog/
* Python API library and shell utilities to monitor file system events.

```
$ sudo pip install watchdog
```

## node js

* http://nodejs.org
* NodeJS is a JavaScript runtime.

```
$ brew install node
```

or

Follow instructions to install node without npm and npm seperatly (cleaner):
	* https://gist.github.com/DanHerbert/9520689
	* https://wilsonmar.github.io/node-osx-install/#Homebrew

or

* http://nodejs.org/download/

### update npm

```
$ npm install -g npm@lts
``


# CONFIGURE
================================================================

* see conf/config.json
* for local configuration use conf/config.local.default.json and copy it to conf/config.local.json


# RUN
================================================================

## install dependencies, build and run (dev)

```
$ npm start
```

## watch for all changes (content, image and sass)

```
$ npm run observe
```

## watch for content and image changes only

```
$ npm run observe-contents
```

## config

* see src/js/config.js

# BUILD
================================================================

## build website for production

```
npm run build:dist
```

* writes files to "dist" directory


## serve files from build

```
$ npm run serve:dist
```

* starts local server and browser to test view build

# CHANGE CONTENT
================================================================

Contents are taken from "contentSourceDirectory" defined in config, converted from markdown to json format and copied to "contentDestinationDirectory". For files having a matching folder (with the same name in the same parent folder) the folder contents are listed in the subpages attribute.

## content repository
The content repository for kazoosh website is located here: git@github.com:barnholdy/kazoosh-website-content.git. Check it out and set "contentSourceDirectory" and "imagesSourceDirectory" in config.js.

## file name
The file name must not end with "_en". This ending is reserved for english translations. Default language is german.
There might be an issue with parent pages names containing '_en' in their name.

## markdown file structure

Markdown files consit of two parts:

* YAML front matter
* markdown body


### YAML front matter
	---
	template: root/projekte/alice.html

	title: Alice im Wunderland
	teaser: Am 16.-26. November ...

	images:
	- projekte/alice_im_wunderland_1.png
	- projekte/alice_im_wunderland_2.png

	...
	
	---
	

### markdown body

	# Headline 1
	
	## Headline 2
	
	* Listitem
	
	...

### images

...

### page order in navgation

* use order attribute (CONF.nav_order_attribute) to define order in navigation
* pages with numbers smaller than zero are excluded from navigation


# CHANGE TEMPLATES
================================================================

Templates are located in "public_html/templates" and are choosen using the following fallback mechanism:

1. Template path from YAML front matter
2. Template path corresponding the file path and name (e.g. for content/root/mitglieder.md it's public_html/templates/root/mitglieder.html) 
3. Template path using "default.html" as name and file path as path (iteratively ascending the folder hierarchy) (e.g. for content/root/projekte/heat.md it's public_html/templates/root/projekte/default.html and then public_html/templates/root/default.html).


# SERVER SETUP
================================================================

## setup service to watch for content changes

* create file: /etc/init/kazoosh-website-content.conf

		#script located at /etc/init/kazoosh-website-content.conf

		description "Upstart script for kazoosh website content observer."

		start on (local-filesystems and net-device-up IFACE=eth0)
		stop on shutdown

		respawn

		chdir /var/www/kazoosh.com
		exec python script/watch.py
		#exec grunt observe-contents

* create file: /etc/init/kazoosh-website-deploy.conf

		#script located at /etc/init/kazoosh-website-deploy.conf

		description "Upstart script for kazoosh website deployment."

		start on (local-filesystems and net-device-up IFACE=eth0)
		stop on shutdown

		respawn

		exec webhook-deployer -c /var/www/kazoosh.com/deploys.json
		
* start service
	
		sudo service kazoosh-website-content start
		sudo service kazoosh-website-deploy start
* stop service
	
		sudo service kazoosh-website-content stop
		sudo service kazoosh-website-deploy stop
		
* check service status
		
		sudo initctl status kazoosh-website-content
		sudo initctl status kazoosh-website-deploy
		
* read log

		sudo cat /var/log/upstart/kazoosh-website-content.log

		sudo gzip -d /var/log/upstart/kazoosh-website-content.log.gz
		
## setup automate deployment

* install github webhook-deployer (https://github.com/Camme/webhook-deployer)

		sudo npm install -g webhook-deployer
		sudo npm install -g nunt
		
* create config: deploys.json

		{
		    "port": 8080,
		    "username": "supercooluser",
		    "password": "...",
		    "deploys": [
		    {
		        "name": "Git Webhook stop kazoosh-website-content service",
		        "type": "github",
		        "repo": "https://github.com/kazooshwebsite/kazoosh-website.git",
		        "basepath": "/var/www/kazoosh.com",
		        "command": "sudo service kazoosh-website-content stop",
		        "branch": "release"
		    },
		    {
		        "name": "Git Webhook pull",
		        "type": "github",
		        "repo": "https://github.com/kazooshwebsite/kazoosh-website.git",
		        "basepath": "/var/www/kazoosh.com",
		        "command": "sudo -u hannes git pull",
		        "branch": "release"
		    },
		    {
		        "name": "Git Webhook npm",
		        "type": "github",
		        "repo": "https://github.com/kazooshwebsite/kazoosh-website.git",
		        "basepath": "/var/www/kazoosh.com",
		        "command": "sudo npm install",
		        "branch": "release"
		    },
		    {
		        "name": "Git Webhook bower",
		        "type": "github",
		        "repo": "https://github.com/kazooshwebsite/kazoosh-website.git",
		        "basepath": "/var/www/kazoosh.com",
		        "command": "sudo -u hannes bower install",
		        "branch": "release"
		    },
		    {
		        "name": "Git Webhook start kazoosh-website-content service",
		        "type": "github",
		        "repo": "https://github.com/kazooshwebsite/kazoosh-website.git",
		        "basepath": "/var/www/kazoosh.com",
		        "command": "sudo service kazoosh-website-content start",
		        "branch": "release"
		    }]
		}
		
* add webhook to github

		Payload URL: http://<server>:<port>/incoming/webhook-deployer
		Content type: application/x-www-form-urlencoded
		
* run as deamon

		webhook-deployer -c deploys.json -d
		
* stop deamon

		webhook-deployer -s
		
	or
	
		ps aux | less
		kill <pid>
		
## deploy

	git checkout release
	git merge master
	git push
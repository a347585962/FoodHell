import subprocess
import os, sys
import getopt

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

def common_clear(submodule_directory, version):
	dr = submodule_directory
	os.chdir(dr)
	os.system("git checkout " + version)
	os.chdir("..")
	os.system('git add '+submodule_directory)
	#os.system('git commit -m "moved ' + submodule_directory + ' to ' + version + '"')
	#os.system('git push')


if __name__ == '__main__':

	""" change commands and add shell"""

	commands_kids = [
    		["git submodule add ssh://git.yanggames.com:29418/~luotianqiang/androidAdsLib.git ads", 'ads'],
    		["git submodule add ssh://git.yanggames.com:29418/~luotianqiang/androidCocos2dxLib.git lib_cocos2dx", 'lib_cocos2dx'],
    		["git submodule add ssh://git.yanggames.com:29418/~luotianqiang/androidComponentLib.git lib_component", 'lib_component'],
	]

	tag = 'kids'

	try:
		opt, args = getopt.getopt(sys.argv[1:], "ht:", ['tag', 'help'])
		for op, value in opt:
			if op in ("-t", "--tag"):
				tag = value
			if op in ("-h", "--help"):
				print "Usage: GitSubmodule.py -t TAG_NAME"
				print "Options:"
				print "  -t  TAG_NAME.Choose what you want to use tag, should be [kids | nonkids],if no input args, kids is the default."
				print ""
				print "Sample 1: ./GitSubmodule.py -t kids"
				print "Sample 2: ./GitSubmodule.py -t nonkids"
				print ""
				sys.exit()
	except getopt.GetoptError:  
            print "Error: Could not find the args."
            print "Usage: GitSubmodule.py -t TAG_NAME"
    	    print "Options:"
    	    print "  -t  TAG_NAME.Choose what you want to use tag, should be [kids | nonkids],if no input args, kids is the default."
    	    print ""
    	    print "Sample 1: ./GitSubmodule.py -t kids"
    	    print "Sample 2: ./GitSubmodule.py -t nonkids"
    	    print ""
    	    sys.exit()

	
	if tag.lower() in ['kids', 'nonkids']: 
		tag = tag.lower()
	else:
		print "Only one args must be 'kids' or 'nonkids'"
		exit()

	if tag == 'kids':
		commands = commands_kids
	else:
		commands = commands_kids

	print commands
	for cmd in commands:
		p = subprocess.Popen(cmd[0], stdout=subprocess.PIPE, env=os.environ, shell=True)
		while True:
			line = p.stdout.readline()
			if not line:
				break
			print line
		err = p.wait()
		if err != 0:
			print "error shell: ", cmd, "git submodule failed"
		common_clear(cmd[0].split(' ')[-1], cmd[1])
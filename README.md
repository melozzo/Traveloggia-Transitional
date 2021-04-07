Traveloggia-Transitional
This is an angular.js app  hosted by an nginx server on a digital ocean droplet 64.225.39.26 - droplet is running ubuntu 

to connect to the droplet
ssh carte-blanche-user@64.225.39.26

path to the angular web pages

/var/www/Traveloggia-Transitional

drdexterua August 8, 2019
Today I finally fixed it.
I entered on droplet through Control Access via browser. And then changed on server file /etc/ssh/sshd_config next lines:
1) PasswordAuthentication yes
2) PermitRootLogin yes
3) PubkeyAuthentication yes
4) AuthorizedKeysFile .ssh/authorized_keys

And then restarted sshd by : systemctl restart sshd
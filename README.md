![Black logo](./webapp/public/images/logo-black.png)

## Contents

 - [The problem](#the-problem)
 - [How EstateUp works](#how-EstateUp-works)
 - [Architecture](#architecture)
 - [Getting started](#getting-started)
 - [User experience](#thoughts-towards-the-user-experience)
 - [Author](#author)
 - [References and credits](#references-and-credits)

# EstateUp - A digital will solution built on XRP
## The Problem
Everyone spends their working life accumulating wealth, products and services. But not many consider what actually happens after we pass away, leaving all the ensuing problems up to the power of a will. 

EstateUp creates a digital will on XRP to allow people to redistribute digital assets and information with their loved ones after they have passed away. 

Wills, estates and testaments are stressful, burden-some and paper-based. In fact, this manual and antiquated [industry is worth $1.27 billion in the UK alone](https://international-adviser.com/five-big-factors-in-the-1-27bn-uk-wills-probate-and-trusts-market/) - imagine the size of the global market. Not to mention the fact that disputes in wills are common, expensive and centralized. A probates lawyer charges a percentage based on the size of a property they are redistributing in a will - **which can cost $30,000 or more**! Wills are stored physically on paper - whether it be at the owner's house or bank. If a will document goes missing, all that was recorded in it goes void. XRP is the perfect solution to store the contents of the will in its entirety on-chain, whilst maintaining the integrity of the document.

As society grows more and more reliant on digital services, we lack the backbone to redistribute assets and access when we pass away. This is a serious problem that affects millions of people. Upon the death of a loved one, the current method of getting access to a service or asset involves: bringing a death certificate; and evidence that a close family member is designated to takeover responsibilities of that service (next of kin). For example, you need proof that a loved one who has passed away designated you to have access to their bank account. The problem is this is a lengthy process for just one service, one bank account, whereas people are signing up to hundreds in their life... social media, insurance, the list goes on. 

This industry is very manual and paper-based. Documents, wills & testaments are stored physically. This industry is ripe for disruption - and XRP is the perfect protocol to build a scalable solution on. 

Once wills are digitized and tokenized, EstateUp unlocks a whole new world of finance with the ability to securitize against the will, e.g. imagine a DeFi protocol that can now plug into EstateUp and offer financial accessibility based on a tokenized will - the possibilities are endless!

## How EstateUp works

**Creating a digital will**
1. A user signs up to EstateUp with an email and password
2. They load funds into their generated XRP wallet (for this hackathon, testnet funds are automatically setup and dispersed)
3. They invite four other EstateUp members by email to become apart of their trusted circle (the hypothesis is that for every one user, they will bring at least one more into the XRP ecosystem)
4. They enter their digital will, which right now is any text they want to share after they pass. This is stored on the XRP blockchain forever.

**Recovering a digital will**
1. Two of the beneficiaries log in to EstateUp and click the "Recover" button in the top right and start the process.
2. Once two of the trusted members have started the process the digital will is retrieved from the XRP blockchain and decrypted. The date that it is viewed and by who is stored on another transaction as proof of access.
3. EstateUp will automatically provision access and record viewing by the beneficiaries - no more disputes about who owns what. Upon the realisation of how seamless &amp; affordable it was to recover the legacy - all of these beneficiaries go and create their own digital legacies - kickstarting a viral effect to onboard people into the XRP ecosystem.

**Explanation of process**

Shamir Secret Sharing is used to cryptographically split up the will into multiple pieces. These pieces are encrypted using the private key of the will owner with each shard encrypted with the private key of each beneficiary. These encrypted cipher pieces are broadcasted in the file contents of the will that is saved on-chain as a file. 

For this hackathon, I have used an elementary form of a Web of Trust / multi-sig - where the four beneficiaries of the owner's legacy each are entitled to reconstruct the legacy.

When the will is recovered, proof of recovery is stored on chain in a separate file - so there is a full audit log available for every action related to the will.

## Challenges and limitations
Since the app was developed for this hackathon, security has not be considered in the development. 

Other challenges encountered was understanding XRP, the consensus algorithm, and implementation using the JavaScript API. Some demo apps were not functional.

For this hackathon, four beneficiaries are hard-coded and cannot be changed. Two out of the four beneficiaries are required to access a will. For production, this should be dynamic and customizable.

## Architecture
EstateUp is built on a MeteorJS web application with a MongoDB backend. Python (Flask) is used to create a Shamirs Secret API. Ripple Lib SDK is the primary library used to connect with blockchain.
```
| python-shamirs/
| -- shamir.py                         # The Flask API used to split and reconstruct the legacy
|
| webapp/
| -- client/*                          # The client-side flow of the MeteorJS web app that a user experiences. Templates are used to display data, client-side javascript is used to interact with the server.
| -- server/methods.js                 # The server-side methods of the MeteorJS web app which integrates the MongoDB database. Methods are called from the client.
| -- imports/server/XRPHelper.js       # Helper class file for interacting with XRP network
| -- lib/router.js                     # The routing for the app
| ----- /collections.js                # The local MongoDB collection used to store the legacy
```

## Getting started
***Prerequisites***
* Install MeteorJS from: https://www.meteor.com/install
* Install Python3.7 from: https://www.python.org/download
* Install virtualenv from: https://virtualenv.pypa.io/en/stable/installation/

***Running EstateUp***
1. In one Terminal/Command Prompt, navigate to the `python-shamirs` directory and activate the virtual environment
```
cd python-shamirs/

# Make sure to use the PATH environment corresponding to Python3.7
virtualenv env 

# If using OSX
source env/bin/activate

# If using Windows
env\Scripts\activate.bat

# After activating virtualenv
pip install -r requirements.txt
python shamir.py
```
2. In a separate terminal window, run the Meteor app
```
cd webapp/
meteor npm install
meteor npm start
```
3. The app should now be running and accessible at http://localhost:3000/

## Thoughts towards the user experience
When developing EstateUp, I tried to make the whole experience as user-friendly as possible. Starting from registration, instead of asking for the typical wallet-creation process (private/public key), I created an experience that's akin to the other services a user might use, only requiring an email and password. In the background, the app creates a wallet for a user. A non-technical user should not be impacted by the technical complexities that cryptocurrency users are used to.

The whole app is designed on Bootstrap 4, a web experience that's universally adopted across the web. By creating a web application, any user anywhere can access the EstateUp service regardless of their device, in a familiar experience that isn't confronting.

I wanted to create an app that gives such great utility that the end user would grow to appreciate the fundamental use of XRP - without having it impact on their experience. By requiring each will owner to invite four other beneficiaries to EstateUp, the app is inherently viral, spreading and onboarding users into the XRP ecosystem based on *utility* rather than price &amp; speculation.

## Author
* Andrew Snow - hi@andrewsnow.me - Telegram: @andsnw

Feel free to reach out if you have any questions, suggestions, or comments!

## References and credits
* https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing 
* https://github.com/shea256/secret-sharing
* https://en.wikipedia.org/wiki/Web_of_trust
* https://en.wikipedia.org/wiki/MongoDB
* https://test.bithomp.com/explorer/
* https://xrpl.org/rippleapi-reference.html
* https://github.com/XRPLF/xrpl.js


const express = require('express')
const app = express()

const puppeteer = require('puppeteer');


app.get('/getdata', function (req, res) {

    (async () => {
        let browser = await puppeteer.launch({
            executablePath:'/Users/qx/Documents/myPuppeteer/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
            headless:true,
            timeout: 0,
            slowMo:250,//指定的毫秒减慢Puppeteer的操作
            args: [            //启动 Chrome 的参数，详见上文中的介绍
                '–no-sandbox',
            ],
            defaultViewport: {width: 1440, height: 780},
            ignoreHTTPSErrors:false,
            ignoreDefaultArgs:["--enable-automation"]
        });
        let page = await browser.newPage();

        await page.setDefaultNavigationTimeout(0)
        await  page.goto('https://ks.feigua.cn/');
//点击确定按钮进行登录
        const tologinButtonElement = await  page.$('.login-btn');
//等待页面跳转完成，一般点击某个按钮需要跳转时，都需要等待 page.waitForNavigation() 执行完毕才表示跳转成功
        tologinButtonElement.click()
//  ***
        const firstText = await page.$eval('.login-title > li:nth-child(2) > a', el => el.innerText);
        console.log('firstText');
        console.log('firstText', firstText);
//  ***
//切换为账号登录
        const phonebtn = await  page.$('.login-title > li:nth-child(2)');
        phonebtn.click()
        page.waitForNavigation()
// await page.waitFor(200);
//输入账号密码
        await  page.type('input[name="tel"]','xxx');
        await  page.type('input[name="pwd"]','xxx');

        const okButtonElement = await  page.$('.btn-login');
        okButtonElement.click();
// page.waitForNavigation()
        await  page.waitFor(2000);

        const page2 = await browser.newPage();
        await page2.setDefaultNavigationTimeout(0)
        await  page2.goto('https://ks.feigua.cn/Member#/Live/RealTimeLiveIndex');
        const newPage = (await browser.pages())[2];
        newPage.waitForNavigation({
            waitUntil: 'networkidle2'
        })

        newPage.waitFor(1000)

        function sleep(delay) {
            for(var t = Date.now(); Date.now() - t <= delay;);
        }

        for (var k=0;k<1;k++){

            await newPage.evaluate( () => {
                document.getElementsByClassName("v-main senior-query living")[0].scrollTop = document.getElementsByClassName("v-main senior-query living")[0].scrollHeight
            })

            const strheight=await newPage.evaluate( () => {
                return document.getElementsByClassName("v-main senior-query living")[0].scrollHeight
            })

            const strtext=await newPage.evaluate( ()=>{
                return document.getElementsByClassName('.good-link')[0].innerHTML
            })

            sleep(500);
        }

        async function getitems() {
            const liveidList = await newPage.$$eval('.item > a', elements => {
                const ctn = elements.map(v => {
                    return v.href.split('liveId=')[1].split('&')[0];
                });
                return ctn;
            });
            const bloggerList = await newPage.$$eval('.item > .btns-group > a', elements => {
                const ctn = elements.map(v => {
                    return v.href.split('&')[1].split('=')[1];
                });
                return ctn;
            });
            const namesList = await newPage.$$eval('.item .hd-left-content > a', elements => {
                const ctn = elements.map(v => {
                    return v.innerText;
                });
                return ctn;
            });
            const audienceList = await newPage.$$eval('.item .hd-right', elements => {
                const ctn = elements.map(v => {
                    return v.innerText;
                });
                return ctn;
            });

            let arr=[]
            let arr1=[]
            for (var m=0;m<namesList.length;m++){
                let temparr={}
                temparr["name"]=namesList[m].trim()
                temparr["boggerid"]=bloggerList[m].trim()
                temparr["liveid"]=liveidList[m].trim()
                temparr["audienceNum"]=audienceList[m].trim()
                arr1.push(temparr)
            }

            res.send({"data":arr1,"num":namesList.length})

            browser.close();


        }
        getitems()


    })().catch((error) =>{
        console.log("error: " + error.message);
    });

})

app.listen(3000, () => console.log('Example app listening on port 3000!'))

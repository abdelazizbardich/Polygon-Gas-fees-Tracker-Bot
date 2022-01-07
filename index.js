import DiscordJS, { Intents } from "discord.js"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config();

const client = new DiscordJS.Client({
    intents : [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
})
client.on('ready',(message)=>{
    console.log("the bot is ready");
})



client.on('messageCreate',(message)=>{
    message.content = message.content.toLowerCase();
    if(message.author.bot){
        return ;
    }
    if(message.content === 'gwei stats'){ // get polygon gas fees stats
        getData(message)
    }
    else if(message.content.includes("gwei stats -time :")){ // // get polygon gas fees stats for every defined time interval
        let time = +message.content.split(':')[1];
        time = time*1000; // convert from ms to s
        if(typeof(time) == "number"){
            if(time >= 5000){ // accept only time greater than or equals 5s
                waitUntil(time,message)
            }else{
                message.reply({
                    content:"Time interval is less than 5s, minimum supported is 5s"
                })
            }
        }else{
            message.reply({
                content:"Cannot get time interval, try again"
            })
        }
    }else if(message.content === "stop"){ // stop all runing time intervals 
        message.reply({
            content:"I cant run any stop command at this time Sorry!"
        })
    }
    else if(message.content.includes("gwei stats -less :")){ // set ploygin gas fees watsher for fees less than given amount
        let less = +message.content.split(':')[1];
        if(typeof(less) == "number"){
            message.reply({
                content:"gwei fees watsher is running on "+less
            });
            let watch = setInterval(() => {
                try {
                    axios.get("https://gasstation-mainnet.matic.network/").then(response=>{
                    if(response.data.standard < less){
                        message.reply({
                            content:"** Gwei fees are less than: "+less+`**\nSafe low: ${response.data.safeLow}, Standard: ${response.data.standard}, Fast: ${response.data.fast}, Rapid: ${response.data.fastest}`
                        })
                        clearInterval(watch)
                    }
                }) 
                } catch (error) {
                    message.reply({
                        content:"Can't get data! Retrying..."
                    })
                } 
            }, 10000);
        }else{
            message.reply({
                content:"cannot get less terget, try again"
            })
        }
    }
    else if(message.content === "joke"){ // get a random joke
        try {
            axios.get("https://api.chucknorris.io/jokes/random").then(res=>{   
                message.reply({content:res.data.value})
            }).catch(res=>{
                message.reply({
                    content:"No jokes for to day :("
                })
            })
        } catch (error) {
           
        }
    }
    else if(message.content === 'help'){ // show Bot commands guide
        message.reply({
            content:`**$$$$$$$$$$$$ Help $$$$$$$$$$$$**\n\n- Get Polygon Gas fees data send : **gwei stats**\n- Get data every time range send : **gwei stats -time :**<Time interval in ms> \n=>Ex: ***gwei stats -time :5***  _this will get data for every 5s_ \n- Set gwei fees watsher : **gwei stats -less :<Time interval in ms>**\n\n-Get random joke: **joke**`
        })
    }else if(message.content === "matic fees"){ // Get matic fees estimation
        try {
            axios.get("https://gasstation-mainnet.matic.network/").then(response=>{
                let predict = (response.data.safeLow * 800000)*0.000000001;
                message.reply({
                    content:"**"+predict+" Matic** Estimation for "+response.data.safeLow+" Gwei"
                })
            })
        } catch (error) {
            message.reply({
                content:"**Can't get data, please try again!***"
            })
        }
    }
})
// Create client login
client.login(process.env.TOKEN);

async function getData(message){ // send api request to polygon gas fees api
    try {
        await axios.get("https://gasstation-mainnet.matic.network/").then(response=>{
            let data = 
            `Safe low: ${response.data.safeLow}, Standard: ${response.data.standard}, Fast: ${response.data.fast}, Rapid: ${response.data.fastest}`;
            message.reply({
                content:data
            })
        })
    } catch (error) {
        message.reply({
            content:"Error!!!"
        })
    }
}

async function waitUntil(time,message){ // Set a time interval waiter
    return await new Promise(resolve => {
      const interval = setInterval(() => {
          getData(message)
          resolve();
      }, +time);
    });
  }

  export default client;
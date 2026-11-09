const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'./tests/ui',timeout:30000,workers:1,use:{baseURL:'http://127.0.0.1:19860',viewport:{width:1600,height:1080},browserName:'chromium',channel:'msedge',screenshot:'only-on-failure'},webServer:{command:'node tests/start-server.cjs',url:'http://127.0.0.1:19860',reuseExistingServer:false}});

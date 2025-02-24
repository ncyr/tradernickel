type Environment = 'local' | 'dev' | 'prod';

const ENV: Environment = (process.env.NEXT_PUBLIC_ENV || 'local') as Environment;

const config = {
  local: {
    apiUrl: 'https://api-local.tradernickel.com:5001/v1',
  },
  dev: {
    apiUrl: 'https://api-dev.tradernickel.com/v1',
  },
  prod: {
    apiUrl: 'https://api.tradernickel.com/v1',
  },
};

export const getConfig = () => config[ENV]; 
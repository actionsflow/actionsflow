# `@actionsflow/trigger-weather`

This is a weather trigger using [Openweathermap API](https://openweathermap.org/) of [Actionsflow](https://github.com/actionsflow/actionsflow). You can watch some city's weather updates by using this trigger.

> This is an official trigger, you don't need to install it manually.

[View trigger on Github](https://github.com/actionsflow/actionsflow/tree/main/packages/actionsflow-trigger-weather)

# Usage

When the temperature is below 13°C at 07:00 AM every morning:

```yaml
on:
  weather:
    apiKey: ${{ secrets.OPENWEATHERMAP_API_KEY }}
    params:
      lat: 51.509865
      lon: -0.118092
      units: metric
    every: "0 7 * * *"
    timeZone: UTC
    filter:
      "current.temp":
        $lt: 13
```

When it will rain today:

```yaml
on:
  weather:
    apiKey: ${{ secrets.OPENWEATHERMAP_API_KEY }}
    params:
      lat: 51.509865
      lon: -0.118092
      units: metric
    every: "0 7 * * *"
    timeZone: UTC
    filter:
      "daily.0.weather.0.main":
        $eq: Rain
```

## Options

- `apiKey`, required, Openweathermap API key, you should get it from [Openweathermap API Keys](https://home.openweathermap.org/api_keys)

- `api`, optional, the default value is [`onecall`](https://openweathermap.org/api/one-call-api), you can also use [the other APIs provided by the Openweathermap](https://openweathermap.org/api).

- `params`, optional, fetch weather API params, See [One Call API](https://openweathermap.org/api/one-call-api), or [Weather API](https://openweathermap.org/api)(If you use the other API)

  For `onecall`, you must provide `lat,lon` field, for example:

  ```yaml
  params:
    lat: 51.509865
    lon: -0.118092
  ```

- `endpoint`, optional, the default value is `https://api.openweathermap.org/data/2.5/`

- `every`, optional, alias of [`on.<trigger>.config.every`](https://actionsflow.github.io/docs/workflow/#ontriggerconfigevery)

- `timeZone`, optional, alias of [`on.<trigger>.config.timeZone`](https://actionsflow.github.io/docs/workflow/#ontriggerconfigtimezone)

- `filter`, optional, alias of [`on.<trigger>.config.filter`](https://actionsflow.github.io/docs/workflow/#ontriggerconfigfilter)

> You can use [General Config for Actionsflow Trigger](https://actionsflow.github.io/docs/workflow/#ontriggerconfig) for more customization.

## Outputs

This trigger's outputs will be the item of the following results.

An `onecall` outputs example:

```bash
{
  "lat": 40.12,
  "lon": -96.66,
  "timezone": "America/Chicago",
  "timezone_offset": -18000,
  "current": {
    "dt": 1595243443,
    "sunrise": 1595243663,
    "sunset": 1595296278,
    "temp": 293.28,
    "feels_like": 293.82,
    "pressure": 1016,
    "humidity": 100,
    "dew_point": 293.28,
    "uvi": 10.64,
    "clouds": 90,
    "visibility": 10000,
    "wind_speed": 4.6,
    "wind_deg": 310,
    "weather": [
      {
        "id": 501,
        "main": "Rain",
        "description": "moderate rain",
        "icon": "10n"
      },
      {
        "id": 201,
        "main": "Thunderstorm",
        "description": "thunderstorm with rain",
        "icon": "11n"
      }
    ],
    "rain": {
      "1h": 2.93
    }
  },
  "minutely": [
    {
      "dt": 1595243460,
      "precipitation": 2.928
    },
    ...
  },
    "hourly": [
    {
      "dt": 1595242800,
      "temp": 293.28,
      "feels_like": 293.82,
      "pressure": 1016,
      "humidity": 100,
      "dew_point": 293.28,
      "clouds": 90,
      "visibility": 10000,
      "wind_speed": 4.6,
      "wind_deg": 123,
      "weather": [
        {
          "id": 501,
          "main": "Rain",
          "description": "moderate rain",
          "icon": "10n"
        }
      ],
      "pop": 0.99,
      "rain": {
        "1h": 2.46
      }
    },
    ...
  }
"daily": [
    {
      "dt": 1595268000,
      "sunrise": 1595243663,
      "sunset": 1595296278,
      "temp": {
        "day": 298.82,
        "min": 293.25,
        "max": 301.9,
        "night": 293.25,
        "eve": 299.72,
        "morn": 293.48
      },
      "feels_like": {
        "day": 300.06,
        "night": 292.46,
        "eve": 300.87,
        "morn": 293.75
      },
      "pressure": 1014,
      "humidity": 82,
      "dew_point": 295.52,
      "wind_speed": 5.22,
      "wind_deg": 146,
      "weather": [
        {
          "id": 502,
          "main": "Rain",
          "description": "heavy intensity rain",
          "icon": "10d"
        }
      ],
      "clouds": 97,
      "pop": 1,
      "rain": 12.57,
      "uvi": 10.64
    },
    ...
    },
"alerts": [
    {
      "sender_name": "NWS Tulsa (Eastern Oklahoma)",
      "event": "Heat Advisory",
      "start": 1597341600,
      "end": 1597366800,
      "description": "...HEAT ADVISORY REMAINS IN EFFECT FROM 1 PM THIS AFTERNOON TO\n8 PM CDT THIS EVENING...\n* WHAT...Heat index values of 105 to 109 degrees expected.\n* WHERE...Creek, Okfuskee, Okmulgee, McIntosh, Pittsburg,\nLatimer, Pushmataha, and Choctaw Counties.\n* WHEN...From 1 PM to 8 PM CDT Thursday.\n* IMPACTS...The combination of hot temperatures and high\nhumidity will combine to create a dangerous situation in which\nheat illnesses are possible."
    },
    ...
  ]
```

You can use the outputs like this:

```yaml
on:
  weather:
    apiKey: ${{ secrets.OPENWEATHERMAP_API_KEY }}
    params:
      lat: 51.509865
      lon: -0.118092
      units: metric
    every: 0
    filter:
      "current.temp":
        $lt: 13
jobs:
  print:
    name: Print
    runs-on: ubuntu-latest
    steps:
      - name: Print Outputs
        env:
          current_temp: ${{ on.weather.outputs.current.temp }}
        run: |
          echo current_temp: $current_temp
```

> For the other API outputs, please see [here](https://openweathermap.org/api)

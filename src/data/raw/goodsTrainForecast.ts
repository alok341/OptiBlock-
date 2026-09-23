// ============================================================
// Raw module — goods_train_forecast.csv
// Preserved exact CSV column names (snake_case)
// ============================================================

export interface GoodsTrainForecastRow {
  forecast_id: string;
  date: string;
  section_id: string;
  expected_goods_trains: number;
  forecast_traffic_level: string;
  forecast_window: string;
  confidence_status: string;
}

export const GOODS_TRAIN_FORECAST: GoodsTrainForecastRow[] = [
  { forecast_id: "GF-701", date: "2026-09-24", section_id: "SEC-106", expected_goods_trains: 4, forecast_traffic_level: "Medium", forecast_window: "12:00-16:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-702", date: "2026-09-26", section_id: "SEC-101", expected_goods_trains: 3, forecast_traffic_level: "Low",    forecast_window: "04:00-08:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-703", date: "2026-09-25", section_id: "SEC-107", expected_goods_trains: 1, forecast_traffic_level: "High",   forecast_window: "12:00-16:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-704", date: "2026-09-24", section_id: "SEC-105", expected_goods_trains: 4, forecast_traffic_level: "Low",    forecast_window: "00:00-04:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-705", date: "2026-09-26", section_id: "SEC-108", expected_goods_trains: 2, forecast_traffic_level: "High",   forecast_window: "00:00-04:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-706", date: "2026-09-26", section_id: "SEC-102", expected_goods_trains: 5, forecast_traffic_level: "High",   forecast_window: "04:00-08:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-707", date: "2026-09-26", section_id: "SEC-105", expected_goods_trains: 3, forecast_traffic_level: "Low",    forecast_window: "20:00-24:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-708", date: "2026-09-28", section_id: "SEC-109", expected_goods_trains: 5, forecast_traffic_level: "Low",    forecast_window: "08:00-12:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-709", date: "2026-09-28", section_id: "SEC-105", expected_goods_trains: 2, forecast_traffic_level: "Medium", forecast_window: "00:00-04:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-710", date: "2026-09-23", section_id: "SEC-104", expected_goods_trains: 4, forecast_traffic_level: "Medium", forecast_window: "00:00-04:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-711", date: "2026-09-29", section_id: "SEC-105", expected_goods_trains: 5, forecast_traffic_level: "Low",    forecast_window: "12:00-16:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-712", date: "2026-09-23", section_id: "SEC-101", expected_goods_trains: 5, forecast_traffic_level: "High",   forecast_window: "12:00-16:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-713", date: "2026-09-25", section_id: "SEC-102", expected_goods_trains: 2, forecast_traffic_level: "Low",    forecast_window: "12:00-16:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-714", date: "2026-09-28", section_id: "SEC-110", expected_goods_trains: 3, forecast_traffic_level: "High",   forecast_window: "00:00-04:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-715", date: "2026-09-25", section_id: "SEC-103", expected_goods_trains: 5, forecast_traffic_level: "Low",    forecast_window: "04:00-08:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-716", date: "2026-09-24", section_id: "SEC-106", expected_goods_trains: 5, forecast_traffic_level: "High",   forecast_window: "08:00-12:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-717", date: "2026-09-28", section_id: "SEC-104", expected_goods_trains: 1, forecast_traffic_level: "High",   forecast_window: "12:00-16:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-718", date: "2026-09-28", section_id: "SEC-103", expected_goods_trains: 3, forecast_traffic_level: "Low",    forecast_window: "12:00-16:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-719", date: "2026-09-27", section_id: "SEC-105", expected_goods_trains: 5, forecast_traffic_level: "High",   forecast_window: "12:00-16:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-720", date: "2026-09-27", section_id: "SEC-103", expected_goods_trains: 5, forecast_traffic_level: "Medium", forecast_window: "08:00-12:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-721", date: "2026-09-25", section_id: "SEC-110", expected_goods_trains: 5, forecast_traffic_level: "Low",    forecast_window: "00:00-04:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-722", date: "2026-09-26", section_id: "SEC-105", expected_goods_trains: 3, forecast_traffic_level: "High",   forecast_window: "08:00-12:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-723", date: "2026-09-23", section_id: "SEC-109", expected_goods_trains: 4, forecast_traffic_level: "High",   forecast_window: "04:00-08:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-724", date: "2026-09-27", section_id: "SEC-106", expected_goods_trains: 5, forecast_traffic_level: "Low",    forecast_window: "08:00-12:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-725", date: "2026-09-28", section_id: "SEC-109", expected_goods_trains: 4, forecast_traffic_level: "Low",    forecast_window: "16:00-20:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-726", date: "2026-09-29", section_id: "SEC-109", expected_goods_trains: 2, forecast_traffic_level: "High",   forecast_window: "08:00-12:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-727", date: "2026-09-26", section_id: "SEC-106", expected_goods_trains: 1, forecast_traffic_level: "Low",    forecast_window: "16:00-20:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-728", date: "2026-09-23", section_id: "SEC-103", expected_goods_trains: 2, forecast_traffic_level: "Low",    forecast_window: "04:00-08:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-729", date: "2026-09-26", section_id: "SEC-104", expected_goods_trains: 1, forecast_traffic_level: "Low",    forecast_window: "16:00-20:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-730", date: "2026-09-28", section_id: "SEC-108", expected_goods_trains: 5, forecast_traffic_level: "High",   forecast_window: "20:00-24:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-731", date: "2026-09-23", section_id: "SEC-106", expected_goods_trains: 2, forecast_traffic_level: "High",   forecast_window: "20:00-24:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-732", date: "2026-09-23", section_id: "SEC-104", expected_goods_trains: 4, forecast_traffic_level: "Low",    forecast_window: "12:00-16:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-733", date: "2026-09-25", section_id: "SEC-109", expected_goods_trains: 4, forecast_traffic_level: "Medium", forecast_window: "20:00-24:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-734", date: "2026-09-29", section_id: "SEC-110", expected_goods_trains: 3, forecast_traffic_level: "High",   forecast_window: "00:00-04:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-735", date: "2026-09-29", section_id: "SEC-105", expected_goods_trains: 1, forecast_traffic_level: "Low",    forecast_window: "16:00-20:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-736", date: "2026-09-23", section_id: "SEC-104", expected_goods_trains: 5, forecast_traffic_level: "Medium", forecast_window: "04:00-08:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-737", date: "2026-09-27", section_id: "SEC-104", expected_goods_trains: 5, forecast_traffic_level: "High",   forecast_window: "04:00-08:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-738", date: "2026-09-28", section_id: "SEC-102", expected_goods_trains: 5, forecast_traffic_level: "Medium", forecast_window: "20:00-24:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-739", date: "2026-09-28", section_id: "SEC-107", expected_goods_trains: 1, forecast_traffic_level: "Low",    forecast_window: "04:00-08:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-740", date: "2026-09-27", section_id: "SEC-106", expected_goods_trains: 2, forecast_traffic_level: "High",   forecast_window: "16:00-20:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-741", date: "2026-09-25", section_id: "SEC-106", expected_goods_trains: 5, forecast_traffic_level: "Medium", forecast_window: "08:00-12:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-742", date: "2026-09-29", section_id: "SEC-107", expected_goods_trains: 3, forecast_traffic_level: "High",   forecast_window: "04:00-08:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-743", date: "2026-09-26", section_id: "SEC-109", expected_goods_trains: 3, forecast_traffic_level: "Medium", forecast_window: "12:00-16:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-744", date: "2026-09-26", section_id: "SEC-101", expected_goods_trains: 1, forecast_traffic_level: "Medium", forecast_window: "16:00-20:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-745", date: "2026-09-27", section_id: "SEC-103", expected_goods_trains: 3, forecast_traffic_level: "Low",    forecast_window: "08:00-12:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-746", date: "2026-09-24", section_id: "SEC-106", expected_goods_trains: 1, forecast_traffic_level: "High",   forecast_window: "08:00-12:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-747", date: "2026-09-23", section_id: "SEC-101", expected_goods_trains: 4, forecast_traffic_level: "Medium", forecast_window: "04:00-08:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-748", date: "2026-09-25", section_id: "SEC-106", expected_goods_trains: 5, forecast_traffic_level: "Low",    forecast_window: "04:00-08:00", confidence_status: "Confirmed" },
  { forecast_id: "GF-749", date: "2026-09-29", section_id: "SEC-105", expected_goods_trains: 1, forecast_traffic_level: "High",   forecast_window: "12:00-16:00", confidence_status: "Forecast"  },
  { forecast_id: "GF-750", date: "2026-09-28", section_id: "SEC-102", expected_goods_trains: 3, forecast_traffic_level: "Medium", forecast_window: "04:00-08:00", confidence_status: "Confirmed" },
];
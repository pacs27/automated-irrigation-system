/** @jsx jsx */
import { jsx, useThemeUI  } from "theme-ui";
import React, { useState, useEffect } from 'react'
import { Line } from "react-chartjs-2";
import "../style.css";

const LineChart = () => {
  const context = useThemeUI()
  const chartRef = React.createRef();
  const initialDataFilter = "day"
  const initialData = {
    labels: [],
    datasets: [{
      label: 'Irrigation',
      fill: true,
      data: [],
      borderWidth: 2,
      backgroundColor: 'rgba(4, 214, 144, 0.1)',
      borderColor: 'rgba(4, 214, 143, 1)',
    }]
  }
  const options = {
    responsive: true,
    elements: {
      point: {
        radius: 0
      }
    },
    scales: {
      yAxes: [
        {
          ticks: {
            fontColor: context.theme.colors.text,
            maxTicksLimit: 10
          },
          id: 'y-axis-0',
          position: 'left',
        },
      ],
      xAxes: [{
        gridLines: {
          display: false,
        },
        ticks: {
          fontColor: context.theme.colors.text, // "#5C657C",
          maxTicksLimit: 4,
          maxRotation: 0,
          minRotation: 0,
          callback: function (value) {
            if (dataFilter === "minute") return new Date(value).toLocaleTimeString('de-DE', { second: 'numeric' }) +'s';
            if (dataFilter === "hour") return new Date(value).toLocaleTimeString('de-DE', { minute: 'numeric' }) + 'min';
            if (dataFilter === "day") return new Date(value).toLocaleTimeString('de-DE', { hour: 'numeric' });
            if (dataFilter === "week") return new Date(value).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
            if (dataFilter === "month") return new Date(value).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
          },
        },
        distribution: 'linear',
      }]
    },
    legend: {
      display: false,
    },
    tooltips: {
      enabled: false,
    },
  };
  const [chartData, setChartData] = useState(initialData);
  const [dataFilter, setDataFilter] = useState(initialDataFilter);



  useEffect(() => {
    console.log(process.env.REACT_APP_BACKEND_URL + "/measurements/" + dataFilter)
    const loadData = () => {
      fetch(process.env.REACT_APP_BACKEND_URL + "/measurements/" + dataFilter)
        .then(res => res.json())
        .then(
          async (liveData) => {
            const timestamps = liveData.map(data => data.timestamp)
            const capacities = liveData.map(data => data.capacity)
            setChartData({
              labels: timestamps,
              datasets: [{
                label: 'Irrigation',
                fill: true,
                data: capacities,
                borderWidth: 2,
                backgroundColor: 'rgba(4, 214, 144, 0.1)',
                borderColor: 'rgba(4, 214, 143, 1)',
              }],
            })
          },
          (error) => {
            console.log(`Coudn't fetch data. Error: ${error}`)
          }
        )
    }
    loadData()
    const intervall = setInterval(() => {
      loadData()
    }, 10000)
    return () => {
      clearInterval(intervall);
    };
  }, [setChartData, dataFilter])

  const selectFilter = (filter) => {
    setDataFilter(filter)
  }

  return (
    <div className="line-chart">
      <select sx={{ color: "text" }} onChange={(e) => selectFilter(e.target.value)} className="chart-drop-down" value={dataFilter}>
        <option value="minute">Last Minute</option>
        <option value="hour">Last Hour</option>
        <option value="day">Last Day</option>
        <option value="week">Last Week</option>
        <option value="month">Last Month</option>
      </select>
      {chartData.dataset ? <div /> : <Line ref={chartRef} data={chartData} options={options} />}
    </div>
  );
};

export default LineChart;
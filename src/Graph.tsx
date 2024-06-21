import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps
{
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement
{
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}>
{
  table: Table | undefined;

  render()
  {
    return React.createElement('perspective-viewer');
  }

  componentDidMount()
  {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker())
    {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table)
    {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);

      // continuous line graph is utilized with the view setup with the y_line style graph
      elem.setAttribute('view', 'y_line');

      // column0pivots property addition to the table allows the stock to be distinguishable on the x-axis or columns set up, 
      // not concerned with stock price anymore, just ratios, so 'column-pivots' property is removed
      // elem.setAttribute('column-pivots', '["stock"]');

      // row-pivots property addition takes care of the x-axis as timestamps
      elem.setAttribute('row-pivots', '["timestamp"]');

      // columns, Helps us focus on a particular part of a stock's data along the y-axis. With this we can print just the data we care about in this case, top_ask_price data for the stock      
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');

      // The aggregates property helps us to handle the cases of duplicated data, observed earlier with just simply clicking the "Start Streaming Data" button
      // In our case, a data point is considered unique if it has a unique ticker and timestamp. Duplicate prices are averaged out.
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));



    }
  }

  componentDidUpdate()
  {
    if (this.table) 
    {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
        // This is another component lifecycle method that is executed whenever the component updates or when the graph receives new data!
      ] as unknown as TableData);
    }
  }
}

export default Graph;

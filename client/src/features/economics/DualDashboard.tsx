import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ResponsiveChartWrapper } from '@/components/ui/ResponsiveChartWrapper';
import { useRtlRecharts } from '@/hooks/useRtlRecharts';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { generateChartData, calculateMundellFlemingEquilibrium, calculateSpilloverEffects, MundellFlemingParams } from '@/lib/economics/mundellFleming';

// Default Economy Params
const defaultParams: MundellFlemingParams = {
  is: {
    autonomousConsumption: 500,
    marginalPropensityConsume: 0.8,
    taxRate: 0.2,
    autonomousInvestment: 1000,
    investmentSensitivity: 50,
    governmentSpending: 1000,
    exports: 500,
    importPropensity: 0.1,
  },
  lm: {
    moneySupply: 5000,
    priceLevel: 1,
    moneyDemandIncomeSensitivity: 0.2,
    moneyDemandInterestSensitivity: 40,
  },
  bop: {
    worldInterestRate: 5,
    exports: 500,
    importPropensity: 0.1,
    capitalFlowSensitivity: 100,
    capitalMobility: 'imperfect',
  }
};

/**
 * Aggressively memoized Chart Component using React.memo.
 * Ensures Economy A charts don't re-render if Economy B parameters change.
 */
const ISLMChart = React.memo(({ params, title, yAxisProps }: { params: MundellFlemingParams, title: string, yAxisProps: any }) => {
  const chartData = useMemo(() => generateChartData(params.is, params.lm, params.bop, 0, 10000, 100), [params]);
  const eq = useMemo(() => calculateMundellFlemingEquilibrium(params.is, params.lm, params.bop, 'floating'), [params]);
  
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>{title} - Equilibrium Y: {eq.Y.toFixed(2)}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveChartWrapper height={300}>
          <LineChart data={chartData} margin={yAxisProps.margin}>
            <XAxis dataKey="income" />
            <YAxis orientation={yAxisProps.yAxisOrientation} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="IS" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="LM" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="BOP" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveChartWrapper>
      </CardContent>
    </Card>
  );
},(prevProps, nextProps) => prevProps.params === nextProps.params);

export function DualDashboard() {
  const [paramsA, setParamsA] = useState<MundellFlemingParams>(defaultParams);
  const [paramsB, setParamsB] = useState<MundellFlemingParams>(defaultParams);
  const rtlProps = useRtlRecharts();

  const handleSimulateShock = () => {
    // Demo a policy shock of +500 Government Spending in Economy A
    const shockDeltaG = 500;
    const spillovers = calculateSpilloverEffects(paramsA, paramsB, shockDeltaG);
    
    // Apply shock to State A
    setParamsA(prev => ({
      ...prev,
      is: { ...prev.is, governmentSpending: prev.is.governmentSpending + shockDeltaG }
    }));
    
    // Apply derived export increases to State B
    setParamsB(prev => ({
      ...prev,
      is: { ...prev.is, exports: prev.is.exports + spillovers.economyB.deltaExports }
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dual-Country Spillover Engine</h2>
        <button
          onClick={handleSimulateShock}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          Simulate +500 G-Shock in Economy A
        </button>
      </div>
      
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Economy A */}
        <ISLMChart params={paramsA} title="Economy A (Source)" yAxisProps={rtlProps} />
        
        {/* Economy B */}
        <ISLMChart params={paramsB} title="Economy B (Recipient)" yAxisProps={rtlProps} />
      </div>
    </div>
  );
}

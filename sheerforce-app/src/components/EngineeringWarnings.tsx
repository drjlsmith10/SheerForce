import type { Beam, AnalysisResults } from '../types/beam';

interface EngineeringWarningsProps {
  beam: Beam;
  results?: AnalysisResults | null;
}

interface Warning {
  type: 'error' | 'warning' | 'info';
  message: string;
}

export function EngineeringWarnings({ beam, results }: EngineeringWarningsProps) {
  const warnings: Warning[] = [];

  // P1.7: Enhanced Input Validation - Check for statically determinate configuration
  const checkStaticallyDeterminate = () => {
    const numSupports = beam.supports.length;

    if (numSupports === 0) {
      warnings.push({
        type: 'error',
        message: 'No supports defined - beam is unstable',
      });
    } else if (numSupports === 1) {
      // Cantilever - must be fixed
      if (beam.supports[0].type !== 'fixed') {
        warnings.push({
          type: 'error',
          message: 'Cantilever beam requires a fixed support',
        });
      }
    } else if (numSupports === 2) {
      // Simply supported - OK
    } else if (numSupports > 2) {
      warnings.push({
        type: 'warning',
        message: `Beam has ${numSupports} supports - currently only cantilever and simply supported beams are fully implemented`,
      });
    }
  };

  // Check support positions are within beam length
  const checkSupportPositions = () => {
    beam.supports.forEach((support, idx) => {
      if (support.position < 0 || support.position > beam.length) {
        warnings.push({
          type: 'error',
          message: `Support ${idx + 1} position (${support.position}) is outside beam length (0 to ${beam.length})`,
        });
      }
    });
  };

  // Check load positions are within beam length
  const checkLoadPositions = () => {
    beam.loads.forEach((load, idx) => {
      if (load.type === 'point' || load.type === 'moment') {
        if (load.position < 0 || load.position > beam.length) {
          warnings.push({
            type: 'error',
            message: `Load ${idx + 1} position (${load.position}) is outside beam length (0 to ${beam.length})`,
          });
        }
      } else if (load.type === 'distributed') {
        if (load.startPosition < 0 || load.endPosition > beam.length) {
          warnings.push({
            type: 'error',
            message: `Distributed load ${idx + 1} extends outside beam length`,
          });
        }
        if (load.startPosition >= load.endPosition) {
          warnings.push({
            type: 'error',
            message: `Distributed load ${idx + 1} has invalid range (start ≥ end)`,
          });
        }
      }
    });
  };

  // Check for unreasonably high values
  const checkUnreasonableValues = () => {
    if (!results) return;

    const forceUnit = beam.units === 'metric' ? 'kN' : 'kips';
    const momentUnit = beam.units === 'metric' ? 'kN·m' : 'kip·ft';

    // Thresholds (rough guidelines)
    const maxReasonableShear = beam.units === 'metric' ? 1000 : 225; // kN or kips
    const maxReasonableMoment = beam.units === 'metric' ? 5000 : 3700; // kN·m or kip·ft

    const maxShear = Math.abs(results.maxShear.value);
    const maxMoment = Math.abs(results.maxMoment.value);

    if (maxShear > maxReasonableShear) {
      warnings.push({
        type: 'warning',
        message: `Maximum shear force (${maxShear.toFixed(2)} ${forceUnit}) is very high for typical beams - verify input values`,
      });
    }

    if (maxMoment > maxReasonableMoment) {
      warnings.push({
        type: 'warning',
        message: `Maximum moment (${maxMoment.toFixed(2)} ${momentUnit}) is very high for typical beams - verify input values`,
      });
    }
  };

  // Check for negative lengths
  const checkBeamLength = () => {
    if (beam.length <= 0) {
      warnings.push({
        type: 'error',
        message: 'Beam length must be positive',
      });
    }

    const maxReasonableLength = beam.units === 'metric' ? 100 : 330; // 100m or 330ft
    if (beam.length > maxReasonableLength) {
      warnings.push({
        type: 'warning',
        message: `Beam length (${beam.length} ${beam.units === 'metric' ? 'm' : 'ft'}) is unusually long - verify input`,
      });
    }
  };

  // Info about deflection not being calculated
  const addDeflectionInfo = () => {
    if (results && beam.loads.length > 0) {
      warnings.push({
        type: 'info',
        message: 'Deflection is not calculated - consider checking L/360 serviceability limits separately',
      });
    }
  };

  // Run all checks
  checkBeamLength();
  checkStaticallyDeterminate();
  checkSupportPositions();
  checkLoadPositions();
  checkUnreasonableValues();
  addDeflectionInfo();

  // Don't render if no warnings
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 md:p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-lg shadow-md">
          <svg
            className="text-white"
            width="18"
            height="18"
            fill="currentColor"
            viewBox="0 0 20 20"
            style={{ display: 'block' }}
          >
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Engineering Warnings</h2>
      </div>

      <div className="space-y-3">
        {warnings.map((warning, idx) => {
          const bgColor = warning.type === 'error'
            ? 'bg-red-50 border-red-200'
            : warning.type === 'warning'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-blue-50 border-blue-200';

          const iconColor = warning.type === 'error'
            ? 'text-red-500'
            : warning.type === 'warning'
            ? 'text-amber-500'
            : 'text-blue-500';

          const textColor = warning.type === 'error'
            ? 'text-red-900'
            : warning.type === 'warning'
            ? 'text-amber-900'
            : 'text-blue-900';

          return (
            <div key={idx} className={`${bgColor} border rounded-lg p-3.5`}>
              <div className="flex items-start gap-3">
                <svg
                  className={`${iconColor} flex-shrink-0`}
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ display: 'block', marginTop: '1px' }}
                >
                  {warning.type === 'error' ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  ) : warning.type === 'warning' ? (
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  )}
                </svg>
                <div className="flex-1">
                  <p className={`text-sm ${textColor} font-semibold mb-1`}>
                    {warning.type === 'error' ? 'Error' : warning.type === 'warning' ? 'Warning' : 'Info'}
                  </p>
                  <p className={`text-sm ${textColor} leading-relaxed`}>
                    {warning.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

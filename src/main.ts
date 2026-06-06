import type { Plugin } from "@crowbartools/firebot-types";

import { PLUGIN_NAME } from "./constants";

import actions from "./actions";
import { DialerUIExtension } from "./ui-extension";

const packageInfo = require("../package.json");

const script: Plugin = {
    manifest: {
        type: "plugin",
        icon: {
            type: "custom",
            url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFJElEQVR4AZyWvUtcaRTGn5EZ81WElNqnC2wxW4Q0Y7FNIPsPbGkxFlaLTZTg5ErQSrBJoYVuEKcVVkEQC0dQAuYWgoU2sqQYuwRlLXQGZs/v3Hnnw5mrspf7vB/nnPs+zznve+/MgB54ffyoRj888PHUsAcJgLhUaqhUWuwBvoBUljsc9wpgcciljKRiDzpFERtggQ+67xTAYm1yKYoyjlwuJ6BbovqJ0T1XqoBe8mSlT5+yqtVqhrqJyJqRyixZD0KF1Noq1jFn6p0qgCeSLMmcWSeWVKns6sOHuouI4zFzAsSAICR2IYgAFtRz3ymATHO5rMiaJ0PP+DbiWALE52yLogghixaGiKIJKaqfiDsF2NNeajKFvFb7bPPPxoSnjc1NCbx+3d4e4qMoiEhiS6V8j4hUAaY2E0UsIK8A5LIsfam8VCicWlaLLggy4D6NtbYHWxSxRlIJ/KWSZGs3GINUATgt0ETISGpMpXzR+qK9Cey3DZuCarVRixk1Q9qNiG/mTB7oFHGfgEbyGnLCZcQZO3Q5y5wETMgmQpJFbfWmiPYcWwIqkIxCy7qWYCNVAE6C1PGuDw7OGkn9lpBFmycC1dyjQmHCRNo+qfOiCghPMDb2q29tXwHd5O3MJycnbcWGeoUUzU7mbdJKZd5s3XccZ+xNST5mwdMjoJs8UUtwrdbOvFsIex/I6aX3739TuTzBY56lD1KaLgFt8iQ6ijr3HDEcyE4h/1ggpGQe2+mfd/KfP3d0fj5sPvnHKorGfNzZLC8f+bRLgFtaDb9+jT57HoSQOcFt8nJ5RJDLzsLQUBWng9+IKGp/K3g9R0d/cV9fAeyVe73pJ6ToHhkRYL93d0c0bEkPD1MReQUggYxgXr1376SvX+teFWygr4C8JZWI4OQSBhp2sotWkZA5RHkv++npiIaGiJGqnnje5hsuAmsuN05nB9Dk2mPVal5sQb1ez7QEzM7OJrW10NiCEhE2sdcwttPLSOJ9BsmsUvlDkDM7P6eVV8FobJKIePv2rY1l34+sxscTQO5GawYMgjw52bLAHCZXG0QkfcZsoSKLrcytWB5/uwIYz89/19bWFkPNzMw4dnZ2BF6+fKlsNtsY6CQfGdl1Jz8qYMm+L7FVA/gq1sRWDUDmkJvbrLJye9esgLzEkEM8MTGhV69e6c2bNyJR5k+fPvUHBry15uzszH5gCg4UglCy2FiAhbXuQE6PcWgoGXHoKDHEAFK2YWFhwStAbCdaAjAiQpmMiygUCl6NNCGmSVDS8+z4+JF/dCAFEJP1/Py8wLNnzwhzDA4Oek/TJeDm5sZerLxOTk50n5BAHqoEKQjEKysrWl1d1ePHj8V1dXVFpydPnnh/dHQkfwumpqYyc3NzWmLDcX1bFMGx5VepVJQm5HXzREMKAnG5XLY/J/YPRd1XqMDe3p4ODw+dnAivwPT0tJdpfX1d29vb2PXvbvJjkiYEUhCIOXCb/C2yp6+vr62VwkFjgh9ysgbYgAvAABACEHFwcIDfhVxeXvrWbGxsKFSE0ww5C+/v76vzevToUWtKUsSwPmg5mgMX0Bx7WQhCBEAEwF/92/5L2YCKfPmyJhB8Zm7dL1688PHa2poA6wE39mm6BAQ/DwBEgOPjY5Hljx+XOv7rzxDW00POiV9eXm4l0xN0y9BXQIhBBEAEC1er3+1b/z24dXFxoefPn/scPyAeuPEBzZ0CwvMsCBACghDImf8f4rD2gwSEYEQASAOYgxBzu79v/h8AAAD//3Vjk6IAAAAGSURBVAMABUQTj+rHYWMAAAAASUVORK5CYII=",
            backgroundColor: "#007c7f"
        },
        name: PLUGIN_NAME,
        description: packageInfo.description,
        author: packageInfo.author,
        version: packageInfo.version,
        minimumFirebotVersion: { major: 5, minor: 67 },
        repo: "https://github.com/zunderscore/firebot-plugin-dialer"
    },
    registers: {
        effects: actions,
        uiExtensions: [
            DialerUIExtension
        ]
    }
};

export default script;
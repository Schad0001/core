package org.wicketstuff.minis;

import org.apache.wicket.protocol.http.WebApplication;
import org.wicketstuff.minis.resolver.WicketServletAndJSPResolver;

/**
 * Application object for your web application. If you want to run this application without
 * deploying, run the Start class.
 * 
 * @see org.wicketstuff.minis.Start#main(String[])
 */
public class WicketApplication extends WebApplication
{
	/**
	 * Constructor
	 */
	public WicketApplication()
	{
	}

	/**
	 * @see org.apache.wicket.Application#getHomePage()
	 */
	@Override
	public Class<HomePage> getHomePage()
	{
		return HomePage.class;
	}
	
	@Override
	protected void init() 
	{
	    	super.init();
	    	getPageSettings().addComponentResolver(new WicketServletAndJSPResolver());
	}
}